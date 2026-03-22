use std::net::SocketAddr;

use axum::{
    Router,
    routing::{get, post},
};
use tower_http::cors::CorsLayer;
use tracing_subscriber;

mod github;
mod handlers;
mod badge;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
        // Health check
        .route("/health", get(handlers::health))
        // GitHub webhook endpoint
        .route("/webhook/github", post(github::webhook::handle_webhook))
        // Scan API (public URL scan)
        .route("/api/scan", post(handlers::scan_url))
        // Badge endpoint
        .route("/badge/{owner}/{repo}", get(badge::serve_badge))
        .layer(CorsLayer::permissive());

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("ClawSafety server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
