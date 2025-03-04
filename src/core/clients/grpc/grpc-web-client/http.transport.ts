/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { grpc } from '@improbable-eng/grpc-web';
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';

function filterHeadersForUndefined(headers: { [key: string]: string | string[] | undefined }): {
  [key: string]: string | string[];
} {
  const filteredHeaders: { [key: string]: string | string[] } = {};

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in headers) {
    const value = headers[key];
    // eslint-disable-next-line no-prototype-builtins
    if (headers.hasOwnProperty(key)) {
      if (value !== undefined) {
        filteredHeaders[key] = value;
      }
    }
  }

  return filteredHeaders;
}

function toArrayBuffer(buf: Buffer): Uint8Array {
  const view = new Uint8Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    view[i] = buf[i];
  }
  return view;
}

function toBuffer(ab: Uint8Array): Buffer {
  const buf = Buffer.alloc(ab.byteLength);
  for (let i = 0; i < buf.length; i++) {
    buf[i] = ab[i];
  }
  return buf;
}

class NodeHttp implements grpc.Transport {
  options: grpc.TransportOptions;

  request!: http.ClientRequest;

  constructor(
    transportOptions: grpc.TransportOptions,
    readonly httpsOptions?: https.RequestOptions
  ) {
    this.options = transportOptions;
  }

  sendMessage(msgBytes: Uint8Array) {
    if (
      !this.options.methodDefinition.requestStream &&
      !this.options.methodDefinition.responseStream
    ) {
      // Disable chunked encoding if we are not using streams
      this.request.setHeader('Content-Length', msgBytes.byteLength);
    }
    this.request.write(toBuffer(msgBytes));
    this.request.end();
  }

  // eslint-disable-next-line class-methods-use-this
  finishSend() {}

  responseCallback(response: http.IncomingMessage) {
    this.options.debug && console.log('NodeHttp.response', response.statusCode);
    const headers = filterHeadersForUndefined(response.headers);
    this.options.onHeaders(new grpc.Metadata(headers), response.statusCode!);

    response.on('data', (chunk) => {
      this.options.debug && console.log('NodeHttp.data', chunk);
      this.options.onChunk(toArrayBuffer(chunk as Buffer));
    });

    response.on('end', () => {
      this.options.debug && console.log('NodeHttp.end');
      this.options.onEnd();
    });
  }

  start(metadata: grpc.Metadata) {
    const headers: { [key: string]: string } = {};
    metadata.forEach((key, values) => {
      headers[key] = values.join(', ');
    });
    const parsedUrl = url.parse(this.options.url);

    const httpOptions = {
      host: parsedUrl.hostname,
      port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : undefined,
      path: parsedUrl.path,
      headers,
      method: 'POST',
      insecure: true,
      rejectUnauthorized: false
    };
    if (parsedUrl.protocol === 'https:') {
      this.request = https.request(
        { ...httpOptions, ...this?.httpsOptions },
        this.responseCallback.bind(this)
      );
    } else {
      this.request = http.request(httpOptions, this.responseCallback.bind(this));
    }
    this.request.on('error', (err) => {
      this.options.debug && console.log('NodeHttp.error', err);
      this.options.onEnd(err);
    });
  }

  cancel() {
    this.options.debug && console.log('NodeHttp.abort');
    this.request.abort();
  }
}

export function NodeHttpTransport(httpsOptions?: https.RequestOptions): grpc.TransportFactory {
  return (opts: grpc.TransportOptions) => new NodeHttp(opts, httpsOptions);
}
