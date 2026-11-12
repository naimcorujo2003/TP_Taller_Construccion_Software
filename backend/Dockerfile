# Stage 1: build the Spring Boot jar (tests are skipped; run them with mvn test)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
# Resolve dependencies first so this layer is cached until pom.xml changes
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

# Stage 2: slim runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8080
# DB_HOST, DB_PORT, DB_USER and DB_PASSWORD are read by application.properties
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
