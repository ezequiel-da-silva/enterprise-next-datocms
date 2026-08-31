import { describe, expect, it } from "vitest";
import {
  readAuthorSocialLinks,
  resolveTeamMembers,
  toSocialNavLink,
} from "./resolve-team-section";

describe("readAuthorSocialLinks", () => {
  it("reads a modular content array", () => {
    const links = readAuthorSocialLinks({
      authorSocialLinks: [
        { id: "s1", plataforma: "LinkedIn", url: "https://linkedin.com/in/a" },
        { id: "s2", plataforma: "GitHub", url: "https://github.com/a" },
      ],
    });
    expect(links).toHaveLength(2);
    expect(links[0]?.plataforma).toBe("LinkedIn");
    expect(links[1]?.id).toBe("s2");
  });

  it("reads a legacy single Social Link object", () => {
    const links = readAuthorSocialLinks({
      author_social_links: {
        id: "s1",
        plataforma: "X",
        url: "https://x.com/a",
        open_in_new_tab: false,
      },
    });
    expect(links).toEqual([
      {
        id: "s1",
        plataforma: "X",
        url: "https://x.com/a",
        linkAria: null,
        openInNewTab: false,
        image: null,
      },
    ]);
  });

  it("skips items without id", () => {
    expect(
      readAuthorSocialLinks({
        authorSocialLinks: [{ plataforma: "LinkedIn", url: "https://linkedin.com" }],
      }),
    ).toEqual([]);
  });

  it("skips javascript: and empty urls", () => {
    expect(
      readAuthorSocialLinks({
        authorSocialLinks: [
          { id: "bad", plataforma: "X", url: "javascript:alert(1)" },
          { id: "empty", plataforma: "Web", url: "   " },
          { id: "ok", plataforma: "GitHub", url: "https://github.com/a" },
        ],
      }),
    ).toEqual([
      expect.objectContaining({ id: "ok", url: "https://github.com/a" }),
    ]);
  });
});

describe("resolveTeamMembers", () => {
  it("skips records without id or name", () => {
    expect(
      resolveTeamMembers({
        members: [
          { __typename: "AuthorRecord", id: "1", authorName: "" },
          { __typename: "AuthorRecord", authorName: "Ada" },
        ],
      }),
    ).toEqual([]);
  });

  it("reads camelCase Author records and nested avatar / socials", () => {
    const members = resolveTeamMembers({
      members: [
        {
          __typename: "AuthorRecord",
          id: "a1",
          authorName: "Ada Lovelace",
          authorSlug: "ada",
          authorRole: "Mathematician",
          avatarBio: {
            __typename: "ImageBlockRecord",
            id: "img1",
            asset: { url: "https://img.example/ada.jpg", alt: "Ada" },
          },
          authorSocialLinks: [{ id: "s1", plataforma: "LinkedIn", url: "https://linkedin.com/in/ada" }],
        },
      ],
    });
    expect(members).toHaveLength(1);
    expect(members[0]).toMatchObject({
      id: "a1",
      authorName: "Ada Lovelace",
      authorSlug: "ada",
      authorRole: "Mathematician",
    });
    expect(members[0]?.avatar?.asset?.url).toBe("https://img.example/ada.jpg");
    expect(members[0]?.socialLinks).toHaveLength(1);
  });

  it("reads snake_case aliases and ignores non-Author items", () => {
    const members = resolveTeamMembers({
      members: [
        { __typename: "PageRecord", id: "p1", author_name: "Nope" },
        {
          id: "a2",
          author_name: "Grace Hopper",
          author_slug: "grace",
          author_role: "Rear Admiral",
        },
      ],
    });
    expect(members).toEqual([
      {
        id: "a2",
        authorName: "Grace Hopper",
        authorSlug: "grace",
        authorRole: "Rear Admiral",
        avatar: null,
        socialLinks: [],
      },
    ]);
  });
});

describe("toSocialNavLink", () => {
  it("defaults openInNewTab to true", () => {
    expect(
      toSocialNavLink({
        id: "s1",
        plataforma: "GitHub",
        url: "https://github.com/a",
      }),
    ).toMatchObject({ openInNewTab: true, image: null, linkAria: null });
  });
});
