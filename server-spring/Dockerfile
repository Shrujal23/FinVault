# --- Build Stage ---

FROM maven:3.9-eclipse-temurin-17 AS builder


WORKDIR /app


COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests -B

# --- Final Stage ---
FROM eclipse-temurin:17-jre-jammy

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

COPY --from=builder /app/target/*.jar application.jar

USER appuser

EXPOSE 4000

ENTRYPOINT ["java", "-jar", "application.jar"]