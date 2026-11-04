// CloudFront Function (cloudfront-js-2.0), viewer-request.
// - www.<domain> → 301 to the apex domain.
// - /foo/ → serves /foo/index.html (S3 has no directory indexes).
// - /foo (no file extension) → 301 to /foo/, matching Astro's trailingSlash: 'always'.
function handler(event) {
  const request = event.request;
  const host = request.headers.host.value;
  const uri = request.uri;

  if (host.startsWith('www.')) {
    return redirect(`https://${host.slice(4)}${uri}${queryString(request.querystring)}`);
  }
  if (uri.endsWith('/')) {
    request.uri = `${uri}index.html`;
    return request;
  }
  const lastSegment = uri.slice(uri.lastIndexOf('/') + 1);
  if (!lastSegment.includes('.')) {
    return redirect(`${uri}/${queryString(request.querystring)}`);
  }
  return request;
}

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: location } },
  };
}

function queryString(querystring) {
  const parts = [];
  for (const key of Object.keys(querystring)) {
    const param = querystring[key];
    const values = param.multiValue ? param.multiValue : [param];
    for (const item of values) {
      parts.push(item.value === '' ? key : `${key}=${item.value}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}
