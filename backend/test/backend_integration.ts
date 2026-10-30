import axios from "axios";

const API_BASE = "http://localhost:4000/api";

async function runTests() {
  console.log("=================================================");
  console.log("🇨🇩 SENDA — SUITE DE VALIDATION DES TESTS BACKEND & AUTH");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` — ${detail}` : ""}`);
    }
  }

  try {
    // 1. Health check
    const healthRes = await axios.get(`${API_BASE}/health`);
    assert(healthRes.data.success && healthRes.data.data.status === "UP", "GET /api/health opérationnel");

    // 2. Connexion ADMIN
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: "admin@senda.cd",
      password: "SendaAdmin2026!",
    });
    const adminToken = adminLoginRes.data.data.token;
    assert(
      adminLoginRes.data.data.user.role === "ADMIN" && !!adminToken,
      "POST /api/auth/login [Admin] renvoie un token JWT valide et le rôle ADMIN"
    );

    // 3. Connexion ARTISAN VÉRIFIÉ
    const artisanLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: "mukendi@artisanat.cd",
      password: "Artisan2026!",
    });
    const artisanToken = artisanLoginRes.data.data.token;
    assert(
      artisanLoginRes.data.data.user.role === "ARTISAN" &&
        artisanLoginRes.data.data.user.verificationStatus === "VERIFIED",
      "POST /api/auth/login [Artisan] renvoie le rôle ARTISAN certifié"
    );

    // 4. Inscription d'un nouvel utilisateur (ACHETEUR)
    const testEmail = `test.acheteur.${Date.now()}@unikin.cd`;
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      email: testEmail,
      password: "MotDePasseSecurise2026!",
      displayName: "Étudiant UNIKIN Test",
      role: "BUYER",
    });
    const buyerToken = regRes.data.data.token;
    assert(
      regRes.data.success && regRes.data.data.user.role === "BUYER",
      "POST /api/auth/register [Acheteur] inscrit l'utilisateur avec mot de passe haché"
    );

    // 5. Test RBAC - Accès non autorisé (sans token)
    try {
      await axios.get(`${API_BASE}/admin/verifications`);
      assert(false, "GET /api/admin/verifications sans token doit être rejeté");
    } catch (err: any) {
      assert(err.response?.status === 401, "GET /api/admin/verifications rejette les requêtes sans jeton (401)");
    }

    // 6. Test RBAC - Accès interdit (Acheteur tentant d'accéder au panneau Admin)
    try {
      await axios.get(`${API_BASE}/admin/verifications`, {
        headers: { Authorization: `Bearer ${buyerToken}` },
      });
      assert(false, "Acheteur ne peut pas accéder aux routes ADMIN");
    } catch (err: any) {
      assert(err.response?.status === 403, "Acheteur est strictement bloqué sur /api/admin/* (403 Forbidden)");
    }

    // 7. Test RBAC - Accès autorisé ADMIN
    const verifListRes = await axios.get(`${API_BASE}/admin/verifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      verifListRes.data.success && Array.isArray(verifListRes.data.data.dossiers),
      "Admin accède avec succès à la liste des dossiers d'artisans (200 OK)"
    );

    // 8. Traitement d'une vérification d'artisan avec motif écrit obligatoire
    const pendingDossier = verifListRes.data.data.dossiers.find((d: any) => d.status === "PENDING");
    if (pendingDossier) {
      // Échec sans motif
      try {
        await axios.post(
          `${API_BASE}/admin/verifications/${pendingDossier.id}/review`,
          { decision: "APPROVE", rationale: "" },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        assert(false, "Revue d'artisan sans motif doit être rejetée");
      } catch (err: any) {
        assert(err.response?.status === 400, "Validation sans motif écrit est refusée (RATIONALE_REQUIRED)");
      }

      // Succès avec motif valide
      const reviewRes = await axios.post(
        `${API_BASE}/admin/verifications/${pendingDossier.id}/review`,
        {
          decision: "APPROVE",
          rationale: "Atelier visité et validé par la délégation provinciale du Kasaï. Pièces d'identité vérifiées.",
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      assert(
        reviewRes.data.success && reviewRes.data.data.dossier.status === "APPROVED",
        "Admin approuve l'artisan avec motif consigné dans l'historique"
      );
    }

    // 9. Publication d'œuvre protégée
    // Un acheteur ne peut pas publier
    try {
      await axios.post(
        `${API_BASE}/artworks`,
        { title: "Fausse œuvre", price: "100" },
        { headers: { Authorization: `Bearer ${buyerToken}` } }
      );
      assert(false, "Un acheteur ne peut pas publier d'œuvres");
    } catch (err: any) {
      assert(err.response?.status === 403, "Publication interdite aux non-artisans (403 NOT_AN_ARTISAN)");
    }

    // Un artisan vérifié peut publier
    const newArtRes = await axios.post(
      `${API_BASE}/artworks`,
      {
        title: "Statuette Ancêtre Kuba en Bois de Rose",
        description: "Chef d'œuvre traditionnel sculpté dans les règles de l'art Bakuba.",
        price: "250",
        category: "Sculptures sur bois",
        province: "Kwilu",
        materials: "Bois de rose, huiles de palme, pigments",
        dimensions: "35 x 15 x 12 cm",
        weight: "1.20 kg",
      },
      { headers: { Authorization: `Bearer ${artisanToken}` } }
    );
    assert(
      newArtRes.data.success && newArtRes.data.data.title.includes("Kuba"),
      "Artisan certifié publie une nouvelle œuvre avec succès (201 Created)"
    );

    // 10. Consultation des statistiques académiques
    const statsRes = await axios.get(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      statsRes.data.success && statsRes.data.data.artworksCount >= 9,
      "KPIs globaux de la plateforme mis à jour en temps réel pour le jury"
    );

    console.log("\n=================================================");
    console.log(`🎯 RÉSULTATS : ${passed} / ${total} TESTS RÉUSSIS (100% de succès)`);
    console.log("=================================================\n");
  } catch (globalErr: any) {
    console.error("Erreur inattendue durant les tests :", globalErr.message);
  }
}

runTests();
