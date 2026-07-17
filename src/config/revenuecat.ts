// Chaves PÚBLICAS do dashboard da RevenueCat (Project > API keys > Public
// app-specific key). Não são segredo: só identificam o app pro SDK, a
// validação real da compra acontece do lado do servidor da RevenueCat.
// Preencha depois de criar o projeto e conectar Play Console/App Store
// Connect em https://app.revenuecat.com.
//
// Enquanto o valor começar com "SUBSTITUA_", o app roda sem RevenueCat
// configurado (ver configurarCompras() em src/services/assinatura.ts) — a
// tela Pro fica com o botão de assinar inoperante e o toggle de simulação
// em Perfil > Modo de teste continua funcionando normalmente.
export const REVENUECAT_API_KEY_ANDROID = 'SUBSTITUA_PELA_CHAVE_ANDROID_DA_REVENUECAT';
export const REVENUECAT_API_KEY_IOS = 'SUBSTITUA_PELA_CHAVE_IOS_DA_REVENUECAT';

// Identificador do Entitlement criado no dashboard da RevenueCat
// (Entitlements > + New) que representa o acesso Pro. Os dois produtos de
// assinatura (fornalha_pro_mensal e fornalha_pro_anual, ver src/services/assinatura.ts)
// precisam estar anexados a este entitlement.
export const ENTITLEMENT_PRO = 'pro';
