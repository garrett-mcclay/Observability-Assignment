const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { ConsoleSpanExporter, SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Import the Jaeger Exporter
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

module.exports = (serviceName) => {
    // Set up Jaeger exporter to send trace data to Jaeger backend
    const exporter = new JaegerExporter({
        endpoint: "http://localhost:14268/api/traces",  // Jaeger's default trace endpoint
        serviceName: serviceName,
    });

    // Set up the OpenTelemetry Node tracer provider
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,  // Name of the service for tracing
        }),
    });

    // Use a SimpleSpanProcessor to send spans to the exporter
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

    // Register the tracer provider
    provider.register();

    // Register instrumentations for Express, MongoDB, and HTTP
    registerInstrumentations({
        instrumentations: [
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
            new HttpInstrumentation(),
        ],
        tracerProvider: provider,
    });

    // Return the tracer for use in the application
    return trace.getTracer(serviceName);
};
