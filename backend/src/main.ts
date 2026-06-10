import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  const configService = app.get(ConfigService);

  // CORS
  // app.enableCors({
  //   origin: configService.get("CORS_ORIGIN") || "http://localhost:3000",
  //   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    
  //   credentials: true,
  // });

// app.enableCors({
//   origin: (origin, callback) => {
//     if (!origin) {
//       return callback(null, true);
//     }

//     const hostname = new URL(origin).hostname;

//     if (hostname.endsWith('.elb.amazonaws.com')) {
//       return callback(null, true);
//     }

//     callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
// });
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Cookie parser
  app.use(cookieParser(configService.get("COOKIE_SECRET")));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("UpToYouShop API")
    .setDescription("E-commerce API for UpToYouShop")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = configService.get("PORT") || 5000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
