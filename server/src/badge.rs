use axum::extract::Path;
use axum::response::{IntoResponse, Response};
use axum::http::{header, StatusCode};

/// Serve a dynamic SVG badge showing the security grade
/// GET /badge/:owner/:repo
pub async fn serve_badge(Path((owner, repo)): Path<(String, String)>) -> Response {
    let (grade, color) = get_grade_for_repo(&owner, &repo);
    let svg = generate_badge_svg(&grade, &color);

    (
        StatusCode::OK,
        [
            (header::CONTENT_TYPE, "image/svg+xml"),
            (header::CACHE_CONTROL, "max-age=300"),
        ],
        svg,
    ).into_response()
}

fn get_grade_for_repo(_owner: &str, _repo: &str) -> (String, String) {
    // TODO: query database for latest scan result
    ("A".to_string(), "#4c1".to_string())
}

fn generate_badge_svg(grade: &str, color: &str) -> String {
    let tmpl = include_str!("badge_template.svg");
    tmpl.replace("{color}", color).replace("{grade}", grade)
}
