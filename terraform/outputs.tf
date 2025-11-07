output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.augs.name
}

output "resource_group_id" {
  description = "ID of the resource group"
  value       = azurerm_resource_group.augs.id
}

output "static_web_app_name" {
  description = "Name of the Static Web App"
  value       = azurerm_static_web_app.augs.name
}

output "static_web_app_id" {
  description = "ID of the Static Web App"
  value       = azurerm_static_web_app.augs.id
}

output "static_web_app_default_hostname" {
  description = "Default hostname of the Static Web App"
  value       = azurerm_static_web_app.augs.default_host_name
}

output "static_web_app_api_key" {
  description = "API key for deploying to the Static Web App"
  value       = azurerm_static_web_app.augs.api_key
  sensitive   = true
}
