use std::sync::Arc;

use tauri::{http::header::*, AssetResolver, Runtime};
use warp::http::{HeaderValue, Response, StatusCode};
use warp::{filters::BoxedFilter, path::FullPath, Reply};
use warp::{Filter, Rejection};

pub fn path<R: Runtime>(resolver: Arc<AssetResolver<R>>) -> BoxedFilter<(impl Reply,)> {
    let p = warp::path::full()
        .and_then(move |path: FullPath| file_response(path, resolver.clone()))
        .boxed();
    p
}

async fn file_response<R: Runtime>(path: FullPath, resolver: Arc<AssetResolver<R>>) -> Result<impl Reply, Rejection> {
    let path = path.as_str();

    let Some(asset) = resolver.get(path.to_string()) else {
        let Some(index_asset) = resolver.get("/index.html".to_string()) else {
            return Err(warp::reject::not_found());
        };
        return Ok(Response::builder()
            .status(StatusCode::OK)
            .header(ACCEPT_RANGES, HeaderValue::from_static("bytes"))
            .header(ACCESS_CONTROL_ALLOW_ORIGIN, HeaderValue::from_static("*"))
            .header(CONTENT_SECURITY_POLICY, HeaderValue::from_static("frame-ancestors *"))
            .header(X_FRAME_OPTIONS, HeaderValue::from_static("ALLOW-FROM *"))
            .body(index_asset.bytes));
    };

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header(ACCEPT_RANGES, HeaderValue::from_static("bytes"))
        .header(ACCESS_CONTROL_ALLOW_ORIGIN, HeaderValue::from_static("*"))
        .header(CONTENT_SECURITY_POLICY, HeaderValue::from_static("frame-ancestors *"))
        .header(X_FRAME_OPTIONS, HeaderValue::from_static("ALLOW-FROM *"))
        .body(asset.bytes))
    // return if asset.is_some() {
    // } else {
    //     Err(warp::reject::not_found())
    // };
}
