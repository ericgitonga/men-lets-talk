import Breadcrumb from "@/components/Breadcrumb";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/env";
import { urlForImage } from "@/sanity/lib/image";
import { BOOKS_QUERY, type SanityBook } from "@/sanity/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Books & Projects | Men Let's Talk",
  description: "Books and projects from the Men Let's Talk movement.",
};

async function getBooks(): Promise<SanityBook[]> {
  // No token configured (e.g. CI, which runs with zero cloud credentials — see
  // ONBOARDING.md) — treat as "no books" rather than attempting an unauthenticated
  // request against the private dataset.
  if (!readToken) return [];

  try {
    return await client.fetch(BOOKS_QUERY);
  } catch (error) {
    console.error("Failed to fetch books from Sanity:", error);
    return [];
  }
}

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <main data-testid="books-page" className="mx-auto max-w-3xl px-6 py-16">
      <Breadcrumb
        data-testid="breadcrumb"
        items={[{ label: "Home", href: "/" }, { label: "Books & Projects" }]}
      />
      <h1 className="text-3xl font-bold">Books &amp; Projects</h1>

      {books.length === 0 ? (
        <p data-testid="books-empty-state" className="mt-8 text-neutral-600">
          No books or projects listed here yet — check back soon.
        </p>
      ) : (
        <ul data-testid="books-list" className="mt-8 space-y-12">
          {books.map((book) => (
            <li key={book._id} data-testid="book-item" className="border-b border-neutral-200 pb-12">
              <div className="flex flex-col gap-6 sm:flex-row">
                {book.coverImage && (
                  <Image
                    src={urlForImage(book.coverImage).width(240).height(360).url()}
                    alt={book.title}
                    width={240}
                    height={360}
                    className="rounded-lg object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{book.title}</h2>
                  <p className="mt-1 text-neutral-600">by {book.author}</p>
                  {book.description && <p className="mt-3">{book.description}</p>}
                  {book.whyWritten && (
                    <p className="mt-3 text-neutral-700">
                      <span className="font-medium">Why this book: </span>
                      {book.whyWritten}
                    </p>
                  )}
                  {book.purchaseUrl && (
                    <a
                      href={book.purchaseUrl}
                      className="mt-4 inline-block rounded-md bg-neutral-900 px-5 py-2 text-white"
                    >
                      Order now
                    </a>
                  )}
                </div>
              </div>
              {book.testimonials && book.testimonials.length > 0 && (
                <ul className="mt-6 space-y-3 border-l-2 border-neutral-200 pl-4">
                  {book.testimonials.map((t) => (
                    <li key={t._key}>
                      <p className="italic">&ldquo;{t.quote}&rdquo;</p>
                      {t.attribution && (
                        <p className="mt-1 text-sm text-neutral-500">— {t.attribution}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
