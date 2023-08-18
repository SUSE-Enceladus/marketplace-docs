## Prerequisites

1. These instructions assume you have an EKS cluster installed and that you have access to that cluster via a `kubeconfig`.
2. Installation requires you have the following tools available and properly configured to access your AWS account, and your EKS cluster:
* `aws`
* `eksctl`
* `helm` (v3 or greater)

## Preparing your cluster

#### OIDC provider

Your EKS cluster must have an OIDC provider installed. To check for an OIDC provider first find the OIDC issuer with the following command. Substitute `$CLUSTER_NAME` with the *Name* of the EKS cluster:

```
aws eks describe-cluster --name $CLUSTER_NAME --query cluster.identity.oidc.issuer --output text
```

A URL is returned, like `https://oidc.eks.region.amazonaws.com/id/1234567890ABCDEF`. The part after `https://` will be referred to in later instructions as the *OIDC Provider Identity*. The final section of the URL, `1234567890ABCDEF`, is the $OIDC_ID.

Using the id of the issuer found above you can check if a provider is installed with the following command:

```
aws iam list-open-id-connect-providers | grep $OIDC_ID
```

If there is no output, you will need to create an OIDC provider:

```
eksctl utils associate-iam-oidc-provider --cluster $CLUSTER_NAME --approve
```

This will return the OIDC provider's ARN, with the ID at the end.

#### IAM Role

An IAM policy needs to be created and associated with a role, to provide necessary permissions. The role must also be passed as an argument during the *helm* deployment. Download [`neuvector-csp-iam-policy.json`](https://suse-marketplace-assets-public.s3.amazonaws.com/neuvector-prime/neuvector-csp-iam-policy.json) to locally inspect the policy. Create the policy with a *policy name* of your choosing:

```
aws iam create-policy --policy-name $POLICY_NAME --policy-document https://suse-marketplace-assets-public.s3.amazonaws.com/neuvector-prime/neuvector-csp-iam-policy.json
```

Download [`neuvector-csp-iam-role.json`](https://suse-marketplace-assets-public.s3.amazonaws.com/neuvector-prime/neuvector-csp-iam-role.json). Edit the document, where:

* `$AWS_ACCOUNT_ID` is your 12-digit AWS account ID (no-dashes)
* `$OIDC_PROVIDER_IDENTITY` is the *OIDC Provider Identity*

The role can then be created with a *role name* of your choosing:

```
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://path/to/neuvector-csp-iam-role.json
```

... and the policy attached to it:

```
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn=arn:aws:iam::$AWS_ACCOUNT_ID:policy/$POLICY_NAME
```

## Admin password

Create a file named `userinitcfg.yaml`, with the following template, where:

* `$PASSWORD` is the initial password for the _admin_ account. **It must contain at least 8 characters, at least 1 uppercase character, at least 1 lowercase character and at least 1 number.**

```
users:
- Fullname: admin
  Password: $PASSWORD
  Role: admin
```

Deploy this config to your EKS cluster:

```
kubectl create secret generic neuvector-init --from-file=userinitcfg.yaml -n neuvector
```

This step is mandatory: the _admin_ user will not be created unless configured with a user-specified password, making the NeuVector deployment unmanageable.


## Installing Neuvector

Log *helm* into the AWS Marketplace ECR, to fetch the application. Note that the AWS Marketplace ECR is always in the `us-east-1` region:

```
export HELM_EXPERIMENTAL_OCI=1

aws --region us-east-1 ecr get-login-password | helm registry login --username AWS --password-stdin 709825985650.dkr.ecr.us-east-1.amazonaws.com
```

Install Neuvector into your cluster using *helm*. Customize your helm installation values if needed:

```
helm install -n neuvector neuvector --create-namespace \
oci://709825985650.dkr.ecr.us-east-1.amazonaws.com/suse/neuvector-csp-billing-adapter-ltd/core --version 2.6.1+20230818 \
--set awsbilling.accountNumber=$AWS_ACCOUNT_ID \
--set awsbilling.roleName=$ROLE_NAME
```

## Log into the NeuVector dashboard

TBD...
