import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const PINATA_BASE_URL = "https://api.pinata.cloud";

export interface SendaMetadataAttribute {
  trait_type: string;
  value: string | number;
}

export interface SendaMetadataPayload {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: SendaMetadataAttribute[];
}

/**
 * Service de téléversement et d'épinglage sécurisé sur le réseau décentralisé IPFS via Pinata.
 * Conforme au chapitre 5 de 03_TRD.md et au script de référence upload.js.
 */
export class PinataService {
  private static getHeaders() {
    return {
      pinata_api_key: process.env.PINATA_API_KEY || "",
      pinata_secret_api_key: process.env.PINATA_SECRET_KEY || "",
    };
  }

  /**
   * Épingle un fichier binaire (image) sur IPFS
   */
  public static async pinFileToIPFS(filePath: string, originalName: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), originalName);

    const headers = {
      ...formData.getHeaders(),
      ...this.getHeaders(),
    };

    try {
      const response = await axios.post(
        `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
        formData,
        { headers }
      );

      const ipfsHash = response.data.IpfsHash;
      return `ipfs://${ipfsHash}`;
    } catch (error: any) {
      console.error("Erreur lors de l'épinglage de l'image sur Pinata:", error?.response?.data || error?.message);
      throw new Error("Échec du téléversement décentralisé sur IPFS");
    }
  }

  /**
   * Épingle un manifeste de métadonnées JSON standardisé sur IPFS
   */
  public static async pinJSONToIPFS(metadata: SendaMetadataPayload, name: string): Promise<string> {
    const body = {
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: `SENDA-Metadata-${name}.json`,
      },
      pinataContent: metadata,
    };

    try {
      const response = await axios.post(
        `${PINATA_BASE_URL}/pinning/pinJSONToIPFS`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            ...this.getHeaders(),
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      return `ipfs://${ipfsHash}`;
    } catch (error: any) {
      console.error("Erreur lors de l'épinglage du JSON sur Pinata:", error?.response?.data || error?.message);
      throw new Error("Échec de la génération du manifeste de métadonnées sur IPFS");
    }
  }
}
