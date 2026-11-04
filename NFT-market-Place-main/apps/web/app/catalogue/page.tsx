import { redirect } from "next/navigation";

interface CataloguePageProps {
  searchParams: {
    categorie?: string;
  };
}

/**
 * Route /catalogue pour diriger les utilisateurs vers le catalogue officiel
 * avec conservation des filtres de catégories.
 */
export default function CatalogueRoute({ searchParams }: CataloguePageProps) {
  const cat = searchParams?.categorie;
  if (cat) {
    redirect(`/?categorie=${encodeURIComponent(cat)}#catalogue`);
  }
  redirect("/#catalogue");
}
