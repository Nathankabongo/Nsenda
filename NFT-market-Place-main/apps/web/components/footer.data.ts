/**
 * SENDA Marketplace — Configuration du Pied de Page (Footer)
 * Architecture des données découplée pour une maintenance et internationalisation optimales.
 * Conforme WCAG 2.1 AA et standard e-commerce / Web3.
 */

export interface TrustBadgeItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: "lock" | "shield" | "award";
  accentColor: "gold" | "green" | "ochre";
}

export interface FooterLinkItem {
  label: string;
  href: string;
  isExternal?: boolean;
  badge?: string;
  ariaLabel?: string;
}

export interface FooterColumnSection {
  id: string;
  title: string;
  navAriaLabel: string;
  links: FooterLinkItem[];
}

export interface SocialLinkItem {
  platform: string;
  href: string;
  ariaLabel: string;
}

export interface FooterConfiguration {
  brand: {
    name: string;
    logoBadge: string;
    tagline: string;
    shortDescription: string;
    socialLinks: SocialLinkItem[];
  };
  trustBadges: TrustBadgeItem[];
  columns: {
    collections: FooterColumnSection;
    trustAndGuarantees: FooterColumnSection;
    helpAndLegal: FooterColumnSection;
  };
  provinces: string[];
  blockchain: {
    networkName: string;
    layer: string;
    status: string;
    explorerUrl: string;
    contractAddress: string;
  };
  copyright: {
    year: number;
    text: string;
  };
}

export const FOOTER_CONFIG: FooterConfiguration = {
  brand: {
    name: "SENDA",
    logoBadge: "S",
    tagline: "L’artisanat congolais authentifié",
    shortDescription:
      "Marketplace décentralisée de l’artisanat congolais. Chaque création est authentifiée, payée sous séquestre et conservée de façon permanente.",
    socialLinks: [
      {
        platform: "X",
        href: "https://x.com/SendaArtisanat",
        ariaLabel: "Suivre SENDA sur X (anciennement Twitter)",
      },
      {
        platform: "Instagram",
        href: "https://instagram.com/senda.congo",
        ariaLabel: "Découvrir nos créateurs sur Instagram",
      },
      {
        platform: "Discord",
        href: "https://discord.gg/senda",
        ariaLabel: "Rejoindre la communauté des artisans sur Discord",
      },
      {
        platform: "GitHub",
        href: "https://github.com/senda-rdc",
        ariaLabel: "Consulter le code open-source et les smart contracts sur GitHub",
      },
      {
        platform: "LinkedIn",
        href: "https://linkedin.com/company/senda-rdc",
        ariaLabel: "Suivre les actualités institutionnelles de SENDA sur LinkedIn",
      },
    ],
  },

  trustBadges: [
    {
      id: "sequestre",
      title: "Séquestre garanti",
      subtitle: "Fonds bloqués jusqu’à réception",
      iconName: "lock",
      accentColor: "gold",
    },
    {
      id: "ateliers",
      title: "Ateliers certifiés",
      subtitle: "Audit sur site",
      iconName: "shield",
      accentColor: "green",
    },
    {
      id: "remuneration",
      title: "Rémunération équitable",
      subtitle: "Redevances reversées aux créateurs",
      iconName: "award",
      accentColor: "ochre",
    },
  ],

  columns: {
    collections: {
      id: "collections",
      title: "Collections",
      navAriaLabel: "Collections de pièces d’artisanat congolais",
      links: [
        {
          label: "Masques traditionnels (Pende, Kuba)",
          href: "/catalogue?categorie=masques",
        },
        {
          label: "Statuettes & Sculptures (Tshokwe, Luba)",
          href: "/catalogue?categorie=sculptures",
        },
        {
          label: "Textiles & Velours Shoowa",
          href: "/catalogue?categorie=textiles",
        },
        {
          label: "Vannerie & Céramiques du Kwilu",
          href: "/catalogue?categorie=vannerie",
        },
        {
          label: "Bijoux & Pectoraux en Malachite",
          href: "/catalogue?categorie=bijoux",
        },
      ],
    },

    trustAndGuarantees: {
      id: "confiance",
      title: "Confiance & Garanties",
      navAriaLabel: "Informations sur le protocole de confiance et garanties",
      links: [
        {
          label: "Comment fonctionne le séquestre",
          href: "/terms#sequestre",
        },
        {
          label: "Vérifier un certificat d’authenticité",
          href: "/nft/1#certificat",
        },
        {
          label: "Notre audit des ateliers",
          href: "/terms#audit",
        },
        {
          label: "Traçabilité par province",
          href: "/terms#tracabilite",
        },
        {
          label: "Politique d’attribution STT",
          href: "/politique-stt",
        },
        {
          label: "Politique de redevances",
          href: "/terms#redevances",
        },
      ],
    },

    helpAndLegal: {
      id: "aide-legal",
      title: "Aide & Légal",
      navAriaLabel: "Aide, contact et mentions légales",
      links: [
        {
          label: "À propos",
          href: "/terms#a-propos",
        },
        {
          label: "FAQ",
          href: "/terms#faq",
        },
        {
          label: "Contact",
          href: "mailto:contact@senda.cd",
        },
        {
          label: "Devenir artisan partenaire",
          href: "/register",
          badge: "Nouveau",
        },
        {
          label: "Conditions d’utilisation",
          href: "/terms",
        },
        {
          label: "Politique de confidentialité",
          href: "/terms#confidentialite",
        },
      ],
    },
  },

  provinces: [
    "Kinshasa",
    "Kwilu",
    "Kasaï",
    "Katanga",
    "Kongo Central",
  ],

  blockchain: {
    networkName: "Polygon Amoy",
    layer: "PoS Testnet",
    status: "Opérationnel",
    explorerUrl: "https://amoy.polygonscan.com/address/0x9a3fc7e44ee5496a93a54fcc0d667fa0cd448952",
    contractAddress: "0x9a3fc7e44ee5496a93a54fcc0d667fa0cd448952",
  },

  copyright: {
    year: 2026,
    text: "© 2026 SENDA — L’artisanat congolais, authentifié et valorisé. Tous droits réservés.",
  },
};
