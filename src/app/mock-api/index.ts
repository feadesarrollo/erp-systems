import { AuthMockApi } from 'app/mock-api/common/auth/api';
import { ErpMockApi } from 'app/mock-api/apps/claims-management/api';
import { NotificationsMockApi } from 'app/mock-api/apps/notifications/api';
import { HumanTalentApi } from './apps/human-talent/api';
import { LandingParkingApi } from './apps/landing-parking/api';

export const mockApiServices = [
    AuthMockApi,
    ErpMockApi,
    NotificationsMockApi,
    HumanTalentApi,
    LandingParkingApi
];
