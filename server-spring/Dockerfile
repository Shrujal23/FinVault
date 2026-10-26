# --- Build Stage ---

# Pin JDK 17.0.20.1+1 (17 LTS security refresh — CVE-2026-60589, CVE-2026-61308, CVE-2026-70907).
FROM eclipse-temurin:17.0.20.1_1-jdk-jammy AS builder

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends maven \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app


COPY pom.xml ./
RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests -B

# --- Final Stage ---
FROM eclipse-temurin:17.0.20.1_1-jre-jammy

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /app

COPY --from=builder /app/target/*.jar application.jar

USER appuser

EXPOSE 4000

ENTRYPOINT ["java", "-jar", "application.jar"]