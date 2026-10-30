import { Request, Response, NextFunction } from "express";
import { verifyJwtToken } from "../utils/crypto";

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: "VISITOR" | "BUYER" | "ARTISAN" | "ADMIN";
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  walletAddress?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware d'authentification obligatoire par jeton JWT
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentification requise. Veuillez fournir un jeton Bearer valide.",
      },
    });
  }

  const decoded = verifyJwtToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Session expirée ou jeton JWT non valide.",
      },
    });
  }

  req.user = decoded as AuthenticatedUser;
  next();
}

/**
 * Middleware d'authentification optionnelle (ne bloque pas les visiteurs)
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (token) {
    const decoded = verifyJwtToken(token);
    if (decoded) {
      req.user = decoded as AuthenticatedUser;
    }
  }
  next();
}

/**
 * Contrôle d'accès basé sur les rôles (RBAC)
 */
export function requireRole(allowedRoles: Array<"BUYER" | "ARTISAN" | "ADMIN">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentification requise." },
      });
    }

    if (!allowedRoles.includes(req.user.role as any)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Accès refusé. Cette action nécessite l'un des rôles suivants : ${allowedRoles.join(", ")}.`,
        },
      });
    }

    next();
  };
}

/**
 * Vérification stricte du statut d'artisan certifié
 */
export function requireVerifiedArtisan(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentification requise." },
    });
  }

  if (req.user.role !== "ARTISAN") {
    return res.status(403).json({
      success: false,
      error: {
        code: "NOT_AN_ARTISAN",
        message: "Seuls les artisans peuvent publier des œuvres.",
      },
    });
  }

  if (req.user.verificationStatus !== "VERIFIED") {
    return res.status(403).json({
      success: false,
      error: {
        code: "ARTISAN_NOT_VERIFIED",
        message:
          "Votre atelier artisanal n'a pas encore été certifié par les administrateurs de SENDA. Veuillez attendre la validation de votre dossier.",
      },
    });
  }

  next();
}
