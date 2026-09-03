"""Golden-path smoke checks. Extend with real specs as pages/flows are built."""

import re

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


def test_get_involved_page_loads():
    with browser_page() as page:
        resp = page.goto("/get-involved")
        assert resp.status == 200
        assert page.get_by_test_id("get-involved-options").is_visible()


def test_register_api_rejects_invalid_body():
    with browser_page() as page:
        resp = page.request.post(f"{BASE_URL}/api/register", data={"eventId": "x"})
        assert resp.status == 400


def test_register_api_returns_503_when_not_configured():
    # No SANITY_API_WRITE_TOKEN in CI (zero cloud credentials — see ONBOARDING.md), so this
    # verifies the route degrades gracefully instead of crashing or silently writing nothing.
    # The full write path (a real registration landing in Sanity) is verified manually before
    # merging, same as the other Sanity-backed features — not something CI can exercise
    # without live write credentials.
    with browser_page() as page:
        resp = page.request.post(
            f"{BASE_URL}/api/register",
            data={"eventId": "x", "name": "Test", "email": "test@example.com"},
        )
        assert resp.status == 503


def test_subscribe_api_rejects_invalid_body():
    with browser_page() as page:
        resp = page.request.post(f"{BASE_URL}/api/subscribe", data={"email": "not-an-email"})
        assert resp.status == 400


def test_subscribe_api_returns_503_when_not_configured():
    # Same rationale as test_register_api_returns_503_when_not_configured: no write token in
    # CI, so this verifies graceful degradation. The full write path is verified manually.
    with browser_page() as page:
        resp = page.request.post(f"{BASE_URL}/api/subscribe", data={"email": "test@example.com"})
        assert resp.status == 503


def test_homepage_has_subscribe_form():
    with browser_page() as page:
        page.goto("/")
        assert page.get_by_test_id("stay-connected-section").get_by_test_id("subscribe-form").is_visible()


def test_whatsapp_button_present_on_every_page():
    for path in ("/", "/about", "/events", "/resources", "/stories", "/contact"):
        with browser_page() as page:
            page.goto(path)
            button = page.get_by_test_id("whatsapp-button")
            assert button.is_visible()
            assert button.get_attribute("href") == "https://wa.me/254720450565"


def test_contact_form_submit_shows_pending_message():
    # No email-delivery backend yet (issue #66) — verify the "coming soon" UX path, not a
    # real send, since there's nothing to send to.
    with browser_page() as page:
        page.goto("/contact")
        page.get_by_label("Name").fill("Test User")
        page.get_by_label("Email").fill("test@example.com")
        page.get_by_label("Message").fill("This is a test message.")
        page.get_by_role("button", name="Send", exact=True).click()
        assert page.get_by_test_id("contact-form-submitted").is_visible()


def test_partners_page_has_become_a_partner_cta():
    with browser_page() as page:
        page.goto("/partners")
        cta = page.get_by_test_id("why-partner-section").get_by_role(
            "link", name="Become a Partner", exact=True
        )
        cta.click()
        page.wait_for_url("**/contact")


def test_talk_page_loads_and_links_to_filtered_resources():
    with browser_page() as page:
        resp = page.goto("/talk")
        assert resp.status == 200
        assert page.get_by_test_id("talk-categories").is_visible()
        page.get_by_role("link", name="See Fatherhood resources →", exact=True).click()
        page.wait_for_url("**/resources?topic=fatherhood")


def test_nav_text_legible_in_dark_mode_browser():
    # Regression test for #64: create-next-app's default prefers-color-scheme: dark media
    # query flipped body text near-white while the header keeps a hardcoded white background,
    # making the nav illegible for any visitor whose OS/browser prefers dark mode. Assert the
    # nav link's computed text color is dark (low luminance), not just non-white, so it stays
    # legible against the header's light background regardless of the visitor's OS preference.
    with browser_page(color_scheme="dark") as page:
        page.goto("/")
        color = page.get_by_test_id("desktop-nav").get_by_role("link", name="Home", exact=True).evaluate(
            "el => getComputedStyle(el).color"
        )
        m = re.match(r"rgba?\((\d+), (\d+), (\d+)", color)
        assert m, f"unexpected color format: {color}"
        r, g, b = (int(x) for x in m.groups())
        luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        assert luminance < 0.5, f"nav text too light for a white background: {color}"


def test_breadcrumb_links_back_home():
    with browser_page() as page:
        page.goto("/about")
        breadcrumb = page.get_by_test_id("breadcrumb")
        assert breadcrumb.is_visible()
        breadcrumb.get_by_role("link", name="Home", exact=True).click()
        page.wait_for_url("**/")
        assert page.get_by_test_id("hero-section").is_visible()


def test_about_page_loads():
    with browser_page() as page:
        resp = page.goto("/about")
        assert resp.status == 200
        assert page.get_by_test_id("our-story-section").is_visible()
        assert page.get_by_test_id("our-values-section").is_visible()


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
    test_get_involved_page_loads,
    test_register_api_rejects_invalid_body,
    test_register_api_returns_503_when_not_configured,
    test_subscribe_api_rejects_invalid_body,
    test_subscribe_api_returns_503_when_not_configured,
    test_homepage_has_subscribe_form,
    test_whatsapp_button_present_on_every_page,
    test_contact_form_submit_shows_pending_message,
    test_partners_page_has_become_a_partner_cta,
    test_about_page_loads,
    test_talk_page_loads_and_links_to_filtered_resources,
    test_nav_text_legible_in_dark_mode_browser,
    test_breadcrumb_links_back_home,
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
