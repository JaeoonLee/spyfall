terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# DynamoDB Table
resource "aws_dynamodb_table" "spyfall_rooms" {
  name           = "SpyfallRooms"
  billing_mode   = "PAY_PER_REQUEST" # Cheapest option for low usage
  hash_key       = "roomId"
  range_key      = "playerId"

  attribute {
    name = "roomId"
    type = "S"
  }

  attribute {
    name = "playerId"
    type = "S"
  }

  tags = {
    Name = "SpyfallRooms"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "spyfall-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "spyfall-lambda-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Resource = aws_dynamodb_table.spyfall_rooms.arn
      }
    ]
  })
}

# Attach basic execution role to Lambda
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.lambda_role.name
}

# Lambda Function
resource "aws_lambda_function" "spyfall_app" {
  filename         = "../.output/server.zip"
  function_name    = "spyfall-app"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  source_code_hash = filebase64sha256("../.output/server.zip")

  environment {
    variables = {
      ACCESS_PASSWORD       = var.access_password
      JWT_SECRET           = var.jwt_secret
      AWS_REGION           = var.aws_region
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy.lambda_dynamodb_policy
  ]
}

# Lambda Function URL (cheaper than API Gateway)
resource "aws_lambda_function_url" "spyfall_app_url" {
  function_name      = aws_lambda_function.spyfall_app.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["date", "keep-alive"]
    max_age          = 86400
  }
}

# S3 Bucket for static assets (optional, for better performance)
resource "aws_s3_bucket" "spyfall_assets" {
  bucket = "spyfall-${random_id.bucket_suffix.hex}"
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_public_access_block" "spyfall_assets" {
  bucket = aws_s3_bucket.spyfall_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "spyfall_assets" {
  bucket = aws_s3_bucket.spyfall_assets.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.spyfall_assets.arn}/*"
      }
    ]
  })
}

# CloudFront Distribution (optional, for better global performance)
resource "aws_cloudfront_distribution" "spyfall_cdn" {
  origin {
    domain_name = regex("^https://([^/]+)", aws_lambda_function_url.spyfall_app_url.function_url)[0]
    origin_id   = "lambda"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled = true

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "lambda"

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "lambda_function_url" {
  value = aws_lambda_function_url.spyfall_app_url.function_url
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.spyfall_cdn.domain_name
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.spyfall_rooms.name
}