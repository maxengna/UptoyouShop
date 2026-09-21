import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME , ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';


// This file must be preloaded before any other application code
export function setupInstrumentation() {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME] : process.env.OTEL_SERVICE_NAME ?? 'nestjs-auto-instrumented',
    [ATTR_SERVICE_VERSION] : process.env.OTEL_SERVICE_VERSION  ?? '1.0.0',
  });

  const traceExporter = new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      'http://localhost:4318/v1/traces',
  });

  const metricExporter = new OTLPMetricExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
      'http://localhost:4318/v1/metrics',
  });
  
  
  const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 1000, // Export metrics every second
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // Enable all auto-instrumentations by default
        '@opentelemetry/instrumentation-fs': {
          enabled: false, // Disable filesystem tracing (too verbose)
        },
      }),
    ],
  });

  sdk.start();
  console.log('Auto-instrumentation initialized');
}



setupInstrumentation();
