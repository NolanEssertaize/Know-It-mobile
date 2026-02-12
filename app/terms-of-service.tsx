import { useTranslation } from 'react-i18next';

import { LegalContent } from '@/shared/components/LegalContent/LegalContent';
import { cgu } from '@/shared/legal';

export default function TermsOfServiceScreen() {
    const { t } = useTranslation();
    return <LegalContent title={t('legal.cgu')} sections={cgu} />;
}
