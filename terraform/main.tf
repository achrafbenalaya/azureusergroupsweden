terraform {
  required_version = ">= 1.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "augs" {
  name     = var.resource_group_name
  location = var.location

  tags = merge(
    var.common_tags,
    {
      Environment = var.environment
      Project     = "Azure User Group Sweden"
      ManagedBy   = "Terraform"
    }
  )
}

# Static Web App
resource "azurerm_static_web_app" "augs" {
  name                = var.static_web_app_name
  resource_group_name = azurerm_resource_group.augs.name
  location            = var.static_web_app_location
  sku_tier            = var.sku_tier
  sku_size            = var.sku_size

  tags = merge(
    var.common_tags,
    {
      Environment = var.environment
      Project     = "Azure User Group Sweden"
      ManagedBy   = "Terraform"
    }
  )
}
