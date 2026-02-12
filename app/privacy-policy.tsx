import { useTranslation } from 'react-i18next';

import { LegalContent } from '@/shared/components/LegalContent/LegalContent';
import { politiqueConfidentialite } from '@/shared/legal';

export default function PrivacyPolicyScreen() {
    const { t } = useTranslation();
    return <LegalContent title={t('legal.privacy')} sections={politiqueConfidentialite} />;
}
