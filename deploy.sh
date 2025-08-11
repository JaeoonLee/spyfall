#!/bin/bash
set -e

echo "🚀 Starting deployment process..."

# Build the application for AWS Lambda
echo "📦 Building application..."
npm run build

# Create deployment package
echo "📦 Creating deployment package..."
cd .output/server
zip -r ../server.zip .
cd ../..

echo "🏗️ Deploying infrastructure with Terraform..."
cd terraform

# Set AWS profile
export AWS_PROFILE=personal-account

# Initialize Terraform if not already done
if [ ! -d ".terraform" ]; then
    terraform init
fi

# Load environment variables
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Ensure ACCESS_PASSWORD is set
if [ -z "$ACCESS_PASSWORD" ]; then
  echo "❌ ERROR: ACCESS_PASSWORD environment variable is not set. Please provide a strong password."
  exit 1
fi

# Apply Terraform configuration
terraform apply -auto-approve \
  -var="access_password=${ACCESS_PASSWORD}" \
  -var="jwt_secret=${JWT_SECRET:-super-secret-jwt-key-for-spyfall-game-authentication-system-2024}" \
  -var="aws_region=${AWS_REGION:-us-east-1}"

# Apply Terraform configuration
terraform apply -auto-approve \
  -var="access_password=${ACCESS_PASSWORD:-spyfall123}" \
  -var="jwt_secret=${JWT_SECRET}" \
  -var="aws_region=${AWS_REGION:-us-east-1}"

# Get the Lambda function URL
LAMBDA_URL=$(terraform output -raw lambda_function_url)
CLOUDFRONT_URL=$(terraform output -raw cloudfront_domain)

echo "✅ Deployment complete!"
echo "🌐 Lambda Function URL: $LAMBDA_URL"
echo "🌐 CloudFront URL: https://$CLOUDFRONT_URL"
echo ""
echo "💡 Environment variables needed:"
echo "   ACCESS_PASSWORD=your-game-password"
echo "   JWT_SECRET=your-jwt-secret"
echo "   AWS_REGION=us-east-1"
echo ""
echo "💰 Cost Optimization Notes:"
echo "   - Using Lambda with Function URLs (no API Gateway costs)"
echo "   - DynamoDB Pay-per-request billing"
echo "   - CloudFront for global performance"
echo "   - Estimated cost: <$5/month for moderate usage"