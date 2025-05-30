data "azurerm_subscription" "current" {
  count = var.subscription_id == null ? 1 : 0
}

locals {
  subscription_id = coalesce(var.subscription_id, one(data.azurerm_subscription.current[*].subscription_id))

  application_jwt_secret_key      = coalesce(var.application_jwt_secret_key, one(module.generate_jwt_secret_key[*].random_bytes))
  application_oauth_client_id     = coalesce(var.application_oauth_client_id, one(module.generate_oauth_client_id[*].random_bytes))
  application_oauth_client_secret = coalesce(var.application_oauth_client_secret, one(module.generate_oauth_client_secret[*].random_bytes))
  application_authorization_code  = coalesce(var.application_authorization_code, one(module.generate_authorization_code[*].random_bytes))

  resource_name_separator    = "-"
  file_path_separator        = "/"
  docker_registry_separator  = "/"
  docker_image_tag_separator = ":"

  output_manifest_files_directory = abspath(join(local.file_path_separator, compact([path.cwd, var.output_manifest_files_directory])))
  output_manifest_files_paths     = module.manifest[*].output_file_path

  tags = merge(
    {
      application = var.application_name
    },
    var.tags
  )
}

module "generate_jwt_secret_key" {
  count = var.application_jwt_secret_key == "" ? 1 : 0

  source = "../common/modules/generate"
}

module "generate_oauth_client_id" {
  count = var.application_oauth_client_id == "" ? 1 : 0

  source = "../common/modules/generate"
}

module "generate_oauth_client_secret" {
  count = var.application_oauth_client_secret == "" ? 1 : 0

  source = "../common/modules/generate"
}

module "generate_authorization_code" {
  count = var.application_authorization_code == "" ? 1 : 0

  source = "../common/modules/generate"
}

module "manifest" {
  count = length(var.manifest_files_paths)

  source = "../common/modules/template"

  input_file_path  = abspath(join(local.file_path_separator, [path.cwd, var.manifest_files_paths[count.index]]))
  output_file_path = join(local.file_path_separator, [
    local.output_manifest_files_directory,
    "${basename(dirname(var.manifest_files_paths[count.index]))}.${basename(var.manifest_files_paths[count.index])}"
  ])

  client_id     = local.application_oauth_client_id
  client_secret = local.application_oauth_client_secret
  base_url      = local.application_service_url
}
