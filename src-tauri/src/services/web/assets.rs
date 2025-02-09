use std::sync::Arc;

use tauri::{AssetResolver, Runtime};

use warp::http::header::*;
use warp::http::{HeaderValue, Response, StatusCode};
use warp::{filters::BoxedFilter, path::FullPath, Filter, Rejection, Reply};

pub fn path<R: Runtime>(resolver: Arc<AssetResolver<R>>) -> BoxedFilter<(impl Reply,)> {
    warp::path::full()
        .and_then(move |path: FullPath| file_response(path, resolver.clone()))
        .boxed()
}

async fn file_response<R: Runtime>(path: FullPath, resolver: Arc<AssetResolver<R>>) -> Result<impl Reply, Rejection> {
    if let Some(asset) = resolver.get(path.as_str().into()) {
        Ok(Response::builder()
            .status(StatusCode::OK)
            .header(ACCEPT_RANGES, HeaderValue::from_static("bytes"))
            .header(ACCESS_CONTROL_ALLOW_ORIGIN, HeaderValue::from_static("*"))
            .header(CONTENT_TYPE, asset.mime_type)
            .header(CONTENT_SECURITY_POLICY, HeaderValue::from_static("frame-ancestors *"))
            .header(X_FRAME_OPTIONS, HeaderValue::from_static("ALLOW-FROM *"))
            .body(asset.bytes))
    } else if let Some(index) = resolver.get("/index.html".into()) {
        Ok(Response::builder()
            .status(StatusCode::OK)
            .header(ACCEPT_RANGES, HeaderValue::from_static("bytes"))
            .header(ACCESS_CONTROL_ALLOW_ORIGIN, HeaderValue::from_static("*"))
            .header(CONTENT_SECURITY_POLICY, HeaderValue::from_static("frame-ancestors *"))
            .header(X_FRAME_OPTIONS, HeaderValue::from_static("ALLOW-FROM *"))
            .body(index.bytes))
    } else {
        Err(warp::reject::not_found())
    }
}
