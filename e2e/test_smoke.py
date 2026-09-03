"""Golden-path smoke checks. Extend with real specs as pages/flows are built."""

from _common import BASE_URL, browser_page

MOBILE_VIEWPORT = {"width": 390, "height": 844}


def test_homepage_loads():
    with browser_page() as page:
        resp = page.goto("/")
        assert resp.status == 200
        assert page.get_by_test_id("hero-section").is_visible()
        assert page.get_by_test_id("what-is-mlt-section").is_visible()
        assert page.get_by_test_id("carrying-section").is_visible()


def test_carrying_topic_links_to_filtered_resources():
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("carrying-section").get_by_role("link", name="Fatherhood", exact=True).click()
        page.wait_for_url("**/resources?topic=fatherhood")


def test_desktop_nav_visible_no_hamburger():
    with browser_page() as page:
        page.goto("/")
        assert page.get_by_test_id("desktop-nav").is_visible()
        assert page.get_by_test_id("mobile-menu-toggle").is_visible() is False


def test_mobile_nav_hidden_behind_hamburger_toggle():
    with browser_page(viewport=MOBILE_VIEWPORT) as page:
        page.goto("/")
        assert page.get_by_test_id("mobile-menu-toggle").is_visible()
        assert page.get_by_test_id("mobile-nav").is_visible() is False
        page.get_by_test_id("mobile-menu-toggle").click()
        assert page.get_by_test_id("mobile-nav").is_visible()
        page.get_by_test_id("mobile-nav").get_by_role("link", name="Events", exact=True).click()
        page.wait_for_url("**/events")


def test_mobile_nav_closes_on_escape():
    with browser_page(viewport=MOBILE_VIEWPORT) as page:
        page.goto("/")
        page.get_by_test_id("mobile-menu-toggle").click()
        assert page.get_by_test_id("mobile-nav").is_visible()
        page.keyboard.press("Escape")
        assert page.get_by_test_id("mobile-nav").is_visible() is False


def test_mobile_nav_closes_on_outside_click():
    with browser_page(viewport=MOBILE_VIEWPORT) as page:
        page.goto("/")
        page.get_by_test_id("mobile-menu-toggle").click()
        assert page.get_by_test_id("mobile-nav").is_visible()
        page.get_by_test_id("hero-section").click(position={"x": 10, "y": 10})
        assert page.get_by_test_id("mobile-nav").is_visible() is False


def test_placeholder_nav_pages_load():
    for path in ("/about", "/talk", "/get-involved"):
        with browser_page() as page:
            resp = page.goto(path)
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


def test_resources_page_loads():
    # Same rationale as test_events_page_loads: no token in CI, so this only checks the page
    # loads and shows its empty state — no CMS content hardcoded here.
    with browser_page() as page:
        resp = page.goto("/resources")
        assert resp.status == 200
        assert page.get_by_test_id("resources-empty-state").is_visible()


def test_resources_topic_filter_loads():
    with browser_page() as page:
        resp = page.goto("/resources?topic=fatherhood")
        assert resp.status == 200
        assert page.get_by_test_id("resources-empty-state").is_visible()


def test_stories_page_loads():
    # Same rationale as the other Sanity-backed pages: no token in CI, so this only checks the
    # page loads and shows its empty state — no CMS content hardcoded here.
    with browser_page() as page:
        resp = page.goto("/stories")
        assert resp.status == 200
        assert page.get_by_test_id("stories-empty-state").is_visible()


def test_partners_page_loads():
    with browser_page() as page:
        resp = page.goto("/partners")
        assert resp.status == 200
        assert page.get_by_test_id("partners-empty-state").is_visible()


def test_community_page_loads():
    with browser_page() as page:
        resp = page.goto("/community")
        assert resp.status == 200
        assert page.get_by_test_id("community-empty-state").is_visible()


def test_books_page_loads():
    with browser_page() as page:
        resp = page.goto("/books")
        assert resp.status == 200
        assert page.get_by_test_id("books-empty-state").is_visible()


TESTS = [
    test_homepage_loads,
    test_carrying_topic_links_to_filtered_resources,
    test_desktop_nav_visible_no_hamburger,
    test_mobile_nav_hidden_behind_hamburger_toggle,
    test_mobile_nav_closes_on_escape,
    test_mobile_nav_closes_on_outside_click,
    test_placeholder_nav_pages_load,
    test_health_endpoint,
    test_events_page_loads,
    test_resources_page_loads,
    test_resources_topic_filter_loads,
    test_stories_page_loads,
    test_partners_page_loads,
    test_community_page_loads,
    test_books_page_loads,
]

if __name__ == "__main__":
    for t in TESTS:
        t()
        print(f"PASS {t.__name__}")
