# Spyfall Game - AWS Deployment Guide

This guide will help you deploy your Spyfall game to AWS at the lowest possible cost.

## Architecture

- **AWS Lambda**: Serverless function hosting (pay only for usage)
- **Lambda Function URL**: Direct HTTPS endpoint (no API Gateway costs)
- **DynamoDB**: NoSQL database with pay-per-request pricing
- **CloudFront**: Global CDN for improved performance (optional)
- **S3**: Static asset storage (optional)

## Prerequisites

1. **AWS Account**: Create a free AWS account
2. **AWS CLI**: Install and configure with your credentials
3. **Terraform**: Install Terraform for infrastructure as code
4. **Node.js**: Version 18+ for building the application

## Cost Estimate

For moderate usage (< 1000 requests/month):
- Lambda: ~$0.20/month
- DynamoDB: ~$1.25/month  
- CloudFront: ~$0.50/month
- **Total: < $2/month**

For higher usage, costs scale automatically but remain very low.

## Deployment Steps

### 1. Clone and Setup

```bash
git clone <your-repo>
cd spyfall
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

Required environment variables:
- `ACCESS_PASSWORD`: Password to access the game
- `JWT_SECRET`: Secret key for JWT tokens (32+ characters)
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

### 3. Deploy to AWS

```bash
npm run deploy
```

This will:
1. Build the Nuxt.js application for AWS Lambda
2. Create a deployment package
3. Deploy infrastructure using Terraform
4. Output your application URLs

### 4. Access Your Game

After deployment, you'll get:
- **Lambda Function URL**: Direct serverless endpoint
- **CloudFront URL**: Global CDN endpoint (recommended for production)

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Build the application
npm run build

# Create deployment package
cd .output/server
zip -r ../server.zip .
cd ../..

# Deploy infrastructure
cd terraform
terraform init
terraform apply
```

## Environment Variables for AWS Lambda

The following environment variables are automatically configured in Lambda:
- `ACCESS_PASSWORD`
- `JWT_SECRET` 
- `AWS_REGION`

## Game Features

✅ **Password-protected access**  
✅ **Player lobby system**  
✅ **Real-time game state sync**  
✅ **Configurable game settings**  
✅ **28 Spyfall locations**  
✅ **8-minute game timer**  
✅ **Spy role assignment**  

## How to Play

1. Go to your deployed URL
2. Enter the game password
3. Enter your name
4. Wait in lobby for other players
5. Vote on game settings
6. Start the game when ready
7. Play Spyfall!

## Monitoring and Logs

- **Lambda Logs**: Check AWS CloudWatch for function logs
- **DynamoDB Metrics**: Monitor table usage in AWS Console
- **CloudFront Analytics**: View global traffic patterns

## Cleanup

To delete all AWS resources and stop billing:

```bash
cd terraform
terraform destroy
```

## Troubleshooting

**Build Issues:**
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies

**Deployment Issues:**
- Verify AWS credentials are configured
- Check that Terraform is installed
- Ensure you have necessary AWS permissions

**Runtime Issues:**
- Check CloudWatch logs for Lambda errors
- Verify environment variables are set correctly
- Confirm DynamoDB table was created

## Cost Optimization Tips

1. **Use Lambda Function URLs** instead of API Gateway (saves ~$3.50/month)
2. **DynamoDB Pay-per-Request** is cheaper than provisioned for low usage
3. **CloudFront** is optional but improves global performance
4. **Lambda cold starts** are acceptable for this use case
5. **No RDS/EC2 instances** needed - fully serverless architecture

## Security Notes

- Game is password-protected
- JWT tokens expire after 12 hours
- API endpoints require authentication
- No sensitive data stored in browser localStorage (except game state)

Enjoy your serverless Spyfall game! 🕵️‍♀️