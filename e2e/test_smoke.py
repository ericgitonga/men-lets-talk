"""Golden-path smoke checks. Extend with real specs as pages/flows are built."""

from _common import BASE_URL, browser_page


def test_homepage_loads():
    with browser_page() as page:
        resp = page.goto("/")
        assert resp.status == 200


def test_health_endpoint():
    with browser_page() as page:
        resp = page.request.get(f"{BASE_URL}/api/health")
        assert resp.status == 200
        assert resp.json() == {"status": "ok"}


def test_events_page_loads():
    # No SANITY_API_READ_TOKEN in CI (this repo's CI runs with zero cloud credentials — see
    # ONBOARDING.md), so the page always renders its empty state here. No event content is
    # asserted — that would mean hardcoding CMS-driven data into a test, which this repo's
    # convention rules out. This only checks the page loads and degrades gracefully rather
    # than erroring when Sanity isn't reachable/configured.
    with browser_page() as page:
        resp = page.goto("/events")
        assert resp.status == 200
        assert page.get_by_test_id("events-empty-state").is_visible()


TESTS = [test_homepage_loads, test_health_endpoint, test_events_page_loads]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"PASS {t.__name__}")
