variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "rg-augs-prod"
}

variable "location" {
  description = "Azure region for the resource group"
  type        = string
  default     = "westeurope"
}

variable "static_web_app_name" {
  description = "Name of the Static Web App"
  type        = string
  default     = "swa-augs-prod"
}

variable "static_web_app_location" {
  description = "Azure region for Static Web App (limited regions available)"
  type        = string
  default     = "westeurope"
  
  validation {
    condition = contains([
      "westeurope",
      "eastus2",
      "centralus",
      "westus2",
      "eastasia",
      "southeastasia"
    ], var.static_web_app_location)
    error_message = "Static Web Apps only available in: westeurope, eastus2, centralus, westus2, eastasia, southeastasia"
  }
}

variable "sku_tier" {
  description = "SKU tier for Static Web App"
  type        = string
  default     = "Free"
  
  validation {
    condition     = contains(["Free", "Standard"], var.sku_tier)
    error_message = "SKU tier must be either Free or Standard"
  }
}

variable "sku_size" {
  description = "SKU size for Static Web App"
  type        = string
  default     = "Free"
  
  validation {
    condition     = contains(["Free", "Standard"], var.sku_size)
    error_message = "SKU size must be either Free or Standard"
  }
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Application = "AzureUserGroupSweden"
    CostCenter  = "Community"
    Owner       = "DevOps Team"
  }
}
