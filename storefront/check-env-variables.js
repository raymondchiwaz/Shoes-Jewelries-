const c = require("ansi-colors")

// Accept multiple env names for the publishable key to be resilient to naming drift
function resolvePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    process.env.MEDUSA_PUBLISHABLE_KEY ||
    process.env.MEDUSA_PUBLISHABLE_API_KEY ||
    ""
  )
}

function checkEnvVariables() {
  const key = resolvePublishableKey()

  if (!key) {
    console.error(c.red.bold("\n🚫 Error: Missing publishable API key\n"))
    console.error(
      c.yellow(
        `  Set one of: ${c.bold(
          "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"
        )}, ${c.bold("MEDUSA_PUBLISHABLE_KEY")}, ${c.bold(
          "MEDUSA_PUBLISHABLE_API_KEY"
        )}`
      )
    )
    console.error(
      c.dim(
        "    Learn how to create a publishable key: https://docs.medusajs.com/v2/resources/storefront-development/publishable-api-keys\n"
      )
    )
    process.exit(1)
  }
}

module.exports = checkEnvVariables
