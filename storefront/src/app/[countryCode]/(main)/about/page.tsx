import { Metadata } from "next"
import Image from "next/image"
import { StoreRegion } from "@medusajs/types"
import { listRegions } from "@lib/data/regions"
import { Layout, LayoutColumn } from "@/components/Layout"

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Guavaland",
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions.flatMap((r) =>
      r.countries
        ? r.countries
          .map((c) => c.iso_2)
          .filter(
            (value): value is string =>
              typeof value === "string" && Boolean(value)
          )
        : []
    )
  )

  const staticParams = countryCodes.map((countryCode) => ({
    countryCode,
  }))

  return staticParams
}

export default function AboutPage() {
  return (
    <>
      <div className="max-md:pt-18">
        <Image
          src="/images/content/13409869987477801.jpg"
          width={2880}
          height={1500}
          alt="Premium Shoes and Jewelry Collection"
          className="md:h-screen md:object-cover"
        />
      </div>
      <div className="pt-8 md:pt-26 pb-26 md:pb-36">
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, lg: 7 }}>
            <h3 className="text-md max-lg:mb-6 md:text-2xl">
              At Guavaland, we believe that true luxury is found in the perfect balance of form, function, and uncompromising quality.
            </h3>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="md:text-md lg:mt-18">
              <p className="mb-5 lg:mb-9">
                Welcome to Guavaland, a sanctuary for those who appreciate the finer things. We specialize in high-quality luxury bags, precision-engineered eyewear, and premium casual shoes that redefine everyday elegance.
              </p>
              <p>
                Our mission is to curate a collection that speaks to your ambition and refined taste. Every item we offer is a masterpiece of design, blending artisanal techniques with contemporary flair to ensure you never have to choose between style and substance.
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn>
            <Image
              src="/images/content/13410982353905697.jpg"
              width={2496}
              height={1404}
              alt="Luxury Accessories Display"
              className="mt-26 lg:mt-36 mb-8 lg:mb-26"
            />
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, lg: 8 }}>
            <h3 className="text-md lg:mb-10 mb-6 md:text-2xl">
              We are dedicated to elevating your daily experience with accessories that resonate with excellence.
            </h3>
          </LayoutColumn>
          <LayoutColumn start={1} end={{ base: 13, lg: 6 }}>
            <div className="mb-16 lg:mb-26">
              <p className="mb-5 md:mb-9">
                Quality is the heartbeat of Guavaland. We understand that a luxury bag, a pair of glasses, or your favorite casual shoes are more than just items—they are companions in your journey. That&apos;s why we obsess over every detail, from the hand-selected leathers and durable hardware of our bags to the lightweight, ergonomic frames of our eyewear.
              </p>
              <p>
                Our commitment to excellence means sourcing only the most resilient and beautiful materials, ensuring that your investment today remains a staple of your wardrobe for years to come. Our attention to detail extends to every stitch and hinge, guaranteeing that your pieces will not only look stunning but will also withstand the test of time.
              </p>
            </div>
          </LayoutColumn>
          <LayoutColumn start={{ base: 2, lg: 1 }} end={{ base: 12, lg: 7 }}>
            <Image
              src="/images/content/13410995041372619.jpg"
              width={1200}
              height={1600}
              alt="Craftsmanship Detail"
              className="mb-16 lg:mb-46"
            />
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="mb-6 lg:mb-20 xl:mb-36">
              <p>
                Our design philosophy is rooted in &quot;Intentional Luxury.&quot; We curate our collections to serve the multifaceted lives of our clients—from the boardroom to the weekend getaway. Whether it&apos;s a structured tote that organizes your world, glasses that sharpen your vision and your look, or casual shoes that provide cloud-like comfort without sacrificing style, we have you covered.
              </p>
            </div>
            <div className="md:text-md max-lg:mb-26">
              <p>
                We also believe that luxury should be responsible. By partnering with ethical manufacturers and prioritizing sustainable materials, we ensure that our pursuit of beauty never comes at the cost of our planet. Our commitment to sustainability ensures that our products are not only beautiful but also kind to the world around us.
              </p>
            </div>
          </LayoutColumn>
        </Layout>
        <Image
          src="/images/content/13410991840005038.jpg"
          width={2880}
          height={1618}
          alt="Guavaland Lifestyle"
          className="mb-8 lg:mb-26"
        />
        <Layout>
          <LayoutColumn start={1} end={{ base: 13, lg: 7 }}>
            <h3 className="text-md max-lg:mb-6 md:text-2xl">
              Our customers are at the center of everything we do!
            </h3>
          </LayoutColumn>
          <LayoutColumn start={{ base: 1, lg: 8 }} end={13}>
            <div className="md:text-md lg:mt-18">
              <p className="mb-5 lg:mb-9">
                Our dedicated team is here to provide a bespoke shopping experience, ensuring you find the perfect piece to complement your lifestyle.
              </p>
              <p>
                We aren&apos;t just selling high-quality goods; we are building a community of individuals who value craftsmanship and character. Thank you for choosing Guavaland as your partner in style and quality.
              </p>
            </div>
          </LayoutColumn>
        </Layout>

        {/* Additional Gallery Section for the remaining images */}
        <div className="mt-26 lg:mt-36 px-4 sm:container mx-auto">
          <h3 className="text-md md:text-2xl mb-8 md:mb-16 text-center">Our Collection Highlights</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
              <Image
                src="/images/content/13409871518023131.jpg"
                fill
                alt="Collection item 1"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
              <Image
                src="/images/content/13409871729521324.jpg"
                fill
                alt="Collection item 2"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
              <Image
                src="/images/content/13409871900523275.jpg"
                fill
                alt="Collection item 3"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
              <Image
                src="/images/content/13410991823586312 copy.jpg"
                fill
                alt="Collection item 4"
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
