import { useTranslation } from 'react-i18next';

import { LegalContent } from '@/shared/components/LegalContent/LegalContent';
import { mentionsLegales } from '@/shared/legal';

export default function LegalMentionsScreen() {
    const { t } = useTranslation();
    return <LegalContent title={t('legal.mentionsLegales')} sections={mentionsLegales} />;
}
