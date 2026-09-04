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


def test_hero_carries_brief_supporting_message():
    # Regression test for #1 (THE BIG IDEA): the brief's exact supporting message — "Talk.
    # Listen. Heal. Grow. Lead." — was never actually rendered anywhere on the site. Assert
    # it's present verbatim in the hero, alongside the core message headline.
    with browser_page() as page:
        page.goto("/")
        hero = page.get_by_test_id("hero-section")
        assert hero.get_by_role("heading", level=1).text_content() == "No man should walk alone."
        assert page.get_by_test_id("supporting-message").text_content() == "Talk. Listen. Heal. Grow. Lead."


def test_footer_privacy_link_not_covered_by_whatsapp_button():
    # Regression test: the fixed WhatsAppButton (bottom-6 right-6, 56px) sits at a constant
    # viewport-relative position, so it visually coincides with the footer's rightmost content
    # the moment a visitor scrolls to the bottom of any page — found while building #86.
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("site-footer").scroll_into_view_if_needed()
        privacy_box = page.get_by_test_id("site-footer").get_by_role(
            "link", name="Privacy", exact=True
        ).bounding_box()
        wa_box = page.get_by_test_id("whatsapp-button").bounding_box()
        overlaps = not (
            privacy_box["x"] + privacy_box["width"] < wa_box["x"]
            or wa_box["x"] + wa_box["width"] < privacy_box["x"]
            or privacy_box["y"] + privacy_box["height"] < wa_box["y"]
            or wa_box["y"] + wa_box["height"] < privacy_box["y"]
        )
        assert not overlaps


def test_footer_present_with_privacy_link_on_every_page():
    for path in ("/", "/about", "/events", "/resources", "/stories", "/contact"):
        with browser_page() as page:
            page.goto(path)
            footer = page.get_by_test_id("site-footer")
            assert footer.is_visible()
            footer.get_by_role("link", name="Privacy", exact=True).click()
            page.wait_for_url("**/privacy")


def test_privacy_page_loads():
    with browser_page() as page:
        resp = page.goto("/privacy")
        assert resp.status == 200
        assert page.get_by_role("heading", level=1).text_content() == "Privacy Notice"


def test_contact_page_links_to_privacy():
    with browser_page() as page:
        page.goto("/contact")
        page.get_by_role("link", name="Privacy Notice", exact=True).click()
        page.wait_for_url("**/privacy")


def test_share_your_story_page_loads_with_consent_checkboxes():
    with browser_page() as page:
        resp = page.goto("/share-your-story")
        assert resp.status == 200
        form = page.get_by_test_id("share-story-form")
        assert form.is_visible()
        # Regression guard for #68/#28: both consent checkboxes must be present and required —
        # a submission without explicit, separately-ticked consent should be impossible.
        processing = page.locator('input[name="processingConsentGiven"]')
        publication = page.locator('input[name="consentGiven"]')
        assert processing.get_attribute("required") is not None
        assert publication.get_attribute("required") is not None


def test_stories_page_has_share_your_story_cta():
    with browser_page() as page:
        page.goto("/stories")
        page.get_by_role("link", name="Share Your Story →", exact=True).click()
        page.wait_for_url("**/share-your-story")


def test_share_story_api_rejects_invalid_body():
    with browser_page() as page:
        resp = page.request.post(f"{BASE_URL}/api/share-story", data={"topics": []})
        assert resp.status == 400


def test_share_story_api_requires_both_consents():
    with browser_page() as page:
        resp = page.request.post(
            f"{BASE_URL}/api/share-story",
            data={"topics": ["faith"], "storyText": "test", "processingConsentGiven": True},
        )
        assert resp.status == 400


def test_share_story_api_returns_503_when_not_configured():
    # No SANITY_API_WRITE_TOKEN in CI (zero cloud credentials — see ONBOARDING.md), so this
    # verifies the route degrades gracefully instead of crashing or silently writing nothing.
    # The full write path (a real draft story landing in Sanity, never published) is verified
    # manually before merging, same as the other Sanity-backed features.
    with browser_page() as page:
        resp = page.request.post(
            f"{BASE_URL}/api/share-story",
            data={
                "topics": ["faith"],
                "storyText": "test",
                "processingConsentGiven": True,
                "consentGiven": True,
            },
        )
        assert resp.status == 503


def test_cta_strategy_primary_ctas_present():
    # #21 CALL-TO-ACTION STRATEGY: the brief names 6 primary CTAs as literal button text. 3 were
    # missing before this — "Find Your Community" (fixed by #8, v0.20.0), "Attend an Event" and
    # "Explore Resources" (fixed here). The 6th, "Share Your Story", is intentionally deferred
    # to #68 (a real feature — public story submission — not a copy tweak).
    with browser_page() as page:
        page.goto("/")
        page.get_by_role("link", name="Explore Resources →", exact=True).click()
        page.wait_for_url("**/resources")

        page.goto("/get-involved")
        page.get_by_role("link", name="Attend an Event →", exact=True).click()
        page.wait_for_url("**/events")


def test_signature_statements_placed_on_other_pages():
    # #22 SIGNATURE HOMEPAGE STATEMENTS: the brief gives a fixed pool of 8 exact statements
    # ("can be used throughout the website as visual breaks"). 4 were completely unused before
    # this — assert each one now appears verbatim on the page it was placed on.
    placements = [
        ("/talk", "You don't have to carry it alone."),
        ("/get-involved", "There is strength in speaking."),
        ("/stories", "Your story matters."),
        ("/about", "Your next chapter can be different."),
    ]
    for path, text in placements:
        with browser_page() as page:
            page.goto(path)
            assert page.get_by_test_id("signature-statement").text_content() == text


def test_stories_heading_uses_full_three_part_statement():
    # Regression test: the brief's exact statement is "Real Men. Real Stories. Real
    # Conversations." — the site had only ever used the first two thirds of it.
    with browser_page() as page:
        page.goto("/stories")
        assert page.get_by_role("heading", level=1).text_content() == (
            "Real Men. Real Stories. Real Conversations."
        )

        page.goto("/")
        preview_section = page.get_by_test_id("stories-preview-section")
        if preview_section.count() > 0:
            assert preview_section.get_by_role("heading", level=2).text_content() == (
                "Real Men. Real Stories. Real Conversations."
            )


def test_homepage_find_your_space_section_always_renders():
    # #8 OUR COMMUNITY: unlike the events/stories previews, these 4 feature categories are
    # static brief content, not CMS-driven — assert the section and all 4 headline names
    # render regardless of whether any real community groups exist in Sanity, and that the CTA
    # links through to /community.
    with browser_page() as page:
        page.goto("/")
        section = page.get_by_test_id("find-your-space-section")
        assert section.is_visible()
        for name in [
            "No Man Walks Alone",
            "Older Men Mentoring the Young",
            "Men with Children & Families",
            "Men in Campus",
        ]:
            assert section.get_by_role("heading", name=name, exact=True).is_visible()
        section.get_by_role("link", name="Find Your Community →", exact=True).click()
        page.wait_for_url("**/community")


def test_homepage_hides_events_section_when_no_events():
    # No token in CI (zero cloud credentials — see ONBOARDING.md), so the homepage upcoming-
    # events teaser (#7 UPCOMING EVENTS) always has nothing to show here. Assert it degrades by
    # not rendering at all, same reasoning as the stories preview. The real path (a real event
    # rendering as a card with a working Register button) is verified manually before merging,
    # same as the other Sanity-backed features.
    with browser_page() as page:
        page.goto("/")
        assert page.get_by_test_id("home-events-section").count() == 0


def test_homepage_hides_stories_preview_when_no_stories():
    # No token in CI (zero cloud credentials — see ONBOARDING.md), so the homepage stories
    # preview (#23, added for the "CONNECTION" emotional-journey step) always has nothing to
    # show here. Assert it degrades by not rendering at all, rather than showing an awkward
    # empty state on a marketing homepage. The real path (a real consented story rendering as
    # a preview card, linking through to /stories) is verified manually before merging, same
    # as the other Sanity-backed features.
    with browser_page() as page:
        page.goto("/")
        assert page.get_by_test_id("stories-preview-section").count() == 0


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


def test_register_api_requires_consent():
    # Regression test for #85 (Kenya DPA 2019 compliance review, #28 §2): a submission without
    # explicit consent must be rejected, same tier as a missing required field.
    with browser_page() as page:
        resp = page.request.post(
            f"{BASE_URL}/api/register",
            data={"eventId": "x", "name": "Test", "email": "test@example.com"},
        )
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
            data={"eventId": "x", "name": "Test", "email": "test@example.com", "consentGiven": True},
        )
        assert resp.status == 503


def test_subscribe_api_rejects_invalid_body():
    with browser_page() as page:
        resp = page.request.post(f"{BASE_URL}/api/subscribe", data={"email": "not-an-email"})
        assert resp.status == 400


def test_subscribe_api_requires_consent():
    with browser_page() as page:
        resp = page.request.post(f"{BASE_URL}/api/subscribe", data={"email": "test@example.com"})
        assert resp.status == 400


def test_subscribe_api_returns_503_when_not_configured():
    # Same rationale as test_register_api_returns_503_when_not_configured: no write token in
    # CI, so this verifies graceful degradation. The full write path is verified manually.
    with browser_page() as page:
        resp = page.request.post(
            f"{BASE_URL}/api/subscribe", data={"email": "test@example.com", "consentGiven": True}
        )
        assert resp.status == 503


def test_subscribe_form_has_required_consent_checkbox():
    with browser_page() as page:
        page.goto("/")
        consent = page.get_by_test_id("stay-connected-section").locator('input[name="consentGiven"]')
        assert consent.get_attribute("required") is not None


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


def test_search_prompts_when_no_query():
    with browser_page() as page:
        resp = page.goto("/search")
        assert resp.status == 200
        assert page.get_by_test_id("search-prompt").is_visible()


def test_search_shows_empty_state_when_no_results():
    # No token in CI (zero cloud credentials — see ONBOARDING.md), so any query returns no
    # results here. The full search path (real content across all 3 types, found and
    # deep-linking correctly) is verified manually before merging, same as the other
    # Sanity-backed features.
    with browser_page() as page:
        resp = page.goto("/search?q=anything")
        assert resp.status == 200
        assert page.get_by_test_id("search-empty-state").is_visible()


def test_header_has_search_link():
    with browser_page() as page:
        page.goto("/")
        page.get_by_test_id("search-link").click()
        page.wait_for_url("**/search")


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


def test_mobile_tap_targets_meet_minimum_size():
    # Regression test for #50: the hamburger toggle (40x34) and mobile nav rows (36px tall)
    # were both below the ~44px minimum comfortable tap target (Apple HIG / Material). Assert
    # a floor rather than an exact size so future spacing tweaks don't need to touch this test.
    MIN_TAP_TARGET = 44
    with browser_page(viewport=MOBILE_VIEWPORT) as page:
        page.goto("/")
        toggle_box = page.get_by_test_id("mobile-menu-toggle").bounding_box()
        assert toggle_box["width"] >= MIN_TAP_TARGET
        assert toggle_box["height"] >= MIN_TAP_TARGET

        page.get_by_test_id("mobile-menu-toggle").click()
        for link in page.get_by_test_id("mobile-nav").get_by_role("link").all():
            box = link.bounding_box()
            assert box["height"] >= MIN_TAP_TARGET, f"{link.text_content()!r} row is only {box['height']}px tall"


def test_mobile_form_inputs_avoid_ios_safari_zoom():
    # Regression test for #50: the subscribe form's email input had an explicit text-sm
    # (14px) font-size. iOS Safari auto-zooms the viewport on focus of any input with a
    # computed font-size under 16px, which is jarring, unexpected UX on a form most visitors
    # will fill out on a phone. Assert every text-entry input on the homepage is >= 16px.
    with browser_page(viewport=MOBILE_VIEWPORT) as page:
        page.goto("/")
        for input_el in page.locator("input[type=email], input[type=text], input[type=tel]").all():
            font_size = float(input_el.evaluate("el => getComputedStyle(el).fontSize").replace("px", ""))
            assert font_size >= 16, f"input font-size {font_size}px will trigger iOS Safari auto-zoom"


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
    test_hero_carries_brief_supporting_message,
    test_footer_privacy_link_not_covered_by_whatsapp_button,
    test_footer_present_with_privacy_link_on_every_page,
    test_privacy_page_loads,
    test_contact_page_links_to_privacy,
    test_share_your_story_page_loads_with_consent_checkboxes,
    test_stories_page_has_share_your_story_cta,
    test_share_story_api_rejects_invalid_body,
    test_share_story_api_requires_both_consents,
    test_share_story_api_returns_503_when_not_configured,
    test_cta_strategy_primary_ctas_present,
    test_signature_statements_placed_on_other_pages,
    test_stories_heading_uses_full_three_part_statement,
    test_homepage_find_your_space_section_always_renders,
    test_homepage_hides_events_section_when_no_events,
    test_homepage_hides_stories_preview_when_no_stories,
    test_carrying_topic_links_to_filtered_resources,
    test_desktop_nav_visible_no_hamburger,
    test_mobile_nav_hidden_behind_hamburger_toggle,
    test_mobile_nav_closes_on_escape,
    test_mobile_nav_closes_on_outside_click,
    test_get_involved_page_loads,
    test_register_api_rejects_invalid_body,
    test_register_api_requires_consent,
    test_register_api_returns_503_when_not_configured,
    test_subscribe_api_rejects_invalid_body,
    test_subscribe_api_requires_consent,
    test_subscribe_api_returns_503_when_not_configured,
    test_subscribe_form_has_required_consent_checkbox,
    test_homepage_has_subscribe_form,
    test_whatsapp_button_present_on_every_page,
    test_search_prompts_when_no_query,
    test_search_shows_empty_state_when_no_results,
    test_header_has_search_link,
    test_contact_form_submit_shows_pending_message,
    test_partners_page_has_become_a_partner_cta,
    test_about_page_loads,
    test_talk_page_loads_and_links_to_filtered_resources,
    test_nav_text_legible_in_dark_mode_browser,
    test_mobile_tap_targets_meet_minimum_size,
    test_mobile_form_inputs_avoid_ios_safari_zoom,
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
