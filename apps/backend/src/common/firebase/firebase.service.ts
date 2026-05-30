import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestoreInstance!: Firestore;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    if (admin.apps.length === 0) {
      const serviceAccountJson = this.configService.get<string>(
        'FIREBASE_SERVICE_ACCOUNT_JSON',
      );
      if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is required');
      }
      const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId:
          this.configService.get<string>('FIREBASE_PROJECT_ID') ??
          (serviceAccount as { project_id?: string }).project_id,
      });
    }
    this.firestoreInstance = admin.firestore();
  }

  get firestore(): Firestore {
    return this.firestoreInstance;
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return admin.auth().verifyIdToken(idToken);
  }
}
