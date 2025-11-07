# Terraform Configuration for Azure User Group Sweden

This Terraform configuration deploys the Azure User Group Sweden static website to Azure Static Web Apps.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- Azure subscription with appropriate permissions

## Resources Created

- **Resource Group**: Container for all Azure resources with proper tagging
- **Static Web App**: Hosts the static website with Free tier by default

## Deployment Steps

### 1. Login to Azure

```bash
az login
```

### 2. Set Your Subscription (if you have multiple)

```bash
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 3. Initialize Terraform

```bash
cd terraform
terraform init
```

### 4. Review the Plan

```bash
terraform plan
```

### 5. Apply the Configuration

```bash
terraform apply
```

Type `yes` when prompted to confirm.

### 6. Get the Deployment Token

After deployment, get the API key for deploying your app:

```bash
terraform output -raw static_web_app_api_key
```

## Deploying Your Website

### Option 1: Using Azure Static Web Apps CLI

```bash
# Install the CLI
npm install -g @azure/static-web-apps-cli

# Deploy from the root of your project
cd ..
swa deploy --deployment-token "YOUR_TOKEN_FROM_TERRAFORM_OUTPUT"
```

### Option 2: Using GitHub Actions

Add the deployment token as a GitHub secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`, then the workflow in `.github/workflows/azure-static-web-apps.yml` will handle deployments automatically.

## Outputs

After deployment, Terraform outputs:

- **resource_group_name**: Name of the resource group
- **static_web_app_name**: Name of the Static Web App
- **static_web_app_default_hostname**: Your website URL
- **static_web_app_api_key**: Deployment token (sensitive)

View outputs:

```bash
terraform output
```

View sensitive output:

```bash
terraform output -raw static_web_app_api_key
```

## Customization

Edit `terraform.tfvars.example` and save as `terraform.tfvars` to customize:

- Resource names
- Azure region
- SKU tier (Free or Standard)
- Tags

## Cost Estimation

### Free Tier (Default)
- **Cost**: $0/month
- **Bandwidth**: 100 GB/month
- **Storage**: 250 MB
- **Custom domains**: Included
- **SSL certificates**: Included

### Standard Tier
- **Cost**: ~$9/month
- **Bandwidth**: 100 GB included
- **Additional features**: Private endpoints, SLA, increased limits

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

## Troubleshooting

### Static Web App Region Availability

If you get an error about region availability, use one of these supported regions:
- `westeurope`
- `eastus2`
- `centralus`
- `westus2`
- `eastasia`
- `southeastasia`

### Authentication Issues

Make sure you're logged in with:
```bash
az account show
```

## Support

For issues, please refer to:
- [Azure Static Web Apps documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Terraform Azure Provider documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
