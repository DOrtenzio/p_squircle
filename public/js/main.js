const uiMessages = {
    it: { noResults: 'Nessun capitolo trovato. Prova con un altro termine.', loading: 'Caricamento...' },
    en: { noResults: 'No chapters found. Try another term.', loading: 'Loading...' },
    fr: { noResults: 'Aucun chapitre trouvé. Essayez un autre terme.', loading: 'Chargement...' },
    de: { noResults: 'Keine Kapitel gefunden. Versuchen Sie einen anderen Begriff.', loading: 'Laden...' },
    es: { noResults: 'No se encontraron capítulos. Prueba con otro término.', loading: 'Cargando...' },
    pt: { noResults: 'Nenhum capítulo encontrado. Tente outro termo.', loading: 'Carregando...' },
    nl: { noResults: 'Geen hoofdstukken gevonden. Probeer een andere term.', loading: 'Laden...' },
    ru: { noResults: 'Главы не найдены. Попробуйте другой термин.', loading: 'Загрузка...' },
    zh: { noResults: '未找到章节。请尝试其他关键词。', loading: '加载中...' },
    ja: { noResults: '章が見つかりません。別の語句をお試しください。', loading: '読み込み中...' },
    ko: { noResults: '장을 찾을 수 없습니다. 다른 검색어를 시도하세요.', loading: '로딩 중...' },
    ar: { noResults: 'لم يتم العثور على فصول. جرّب مصطلحًا آخر.', loading: 'جاري التحميل...' },
    hi: { noResults: 'कोई अध्याय नहीं मिला। कोई अन्य शब्द आज़माएँ।', loading: 'लोड हो रहा है...' },
    tr: { noResults: 'Bölüm bulunamadı. Başka bir terim deneyin.', loading: 'Yükleniyor...' },
    pl: { noResults: 'Nie znaleziono rozdziałów. Spróbuj innego terminu.', loading: 'Ładowanie...' },
    uk: { noResults: 'Розділів не знайдено. Спробуйте інший термін.', loading: 'Завантаження...' }
};

const chaptersData = {
    it: [
        { number: 0, title: 'Matematica di base', desc: 'Anelli, polinomi, aritmetica modulare e campi finiti' },
        { number: 1, title: 'Crittografia simmetrica', desc: 'Cifrari a chiave segreta, AES e modalità di funzionamento' },
        { number: 2, title: 'Crittografia asimmetrica', desc: 'RSA, scambio di chiavi Diffie‑Hellman e firme digitali' },
        { number: 3, title: 'La minaccia quantistica', desc: 'Algoritmo di Shor e impatto su RSA ed ECC' },
        { number: 4, title: 'Reticoli (lattices)', desc: 'Definizione, problemi SVP e CVP, basi per la crittografia' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Problema Learning‑with‑Errors su moduli, fondamento di ML‑KEM' },
        { number: 6, title: 'KEM (Key Encapsulation Mechanism)', desc: 'Struttura e proprietà di un KEM, ruolo in ML‑KEM' },
        { number: 7, title: 'NTT per l\'efficienza', desc: 'Trasformata di Numero Teorica e moltiplicazione rapida in anelli' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Descrizione completa dello standard, parametri e passi' },
        { number: 9, title: 'Sicurezza e parametri', desc: 'Livelli di sicurezza, scelta dei parametri e analisi' },
        { number: 10, title: 'Implementazioni pratiche', desc: 'Esempi di codice, ottimizzazioni e test vettoriali' }
    ],
    en: [
        { number: 0, title: 'Basic Mathematics', desc: 'Rings, polynomials, modular arithmetic and finite fields' },
        { number: 1, title: 'Symmetric Cryptography', desc: 'Secret-key ciphers, AES and operation modes' },
        { number: 2, title: 'Asymmetric Cryptography', desc: 'RSA, Diffie‑Hellman key exchange and digital signatures' },
        { number: 3, title: 'Quantum Threat', desc: 'Shor\'s algorithm and impact on RSA and ECC' },
        { number: 4, title: 'Lattices', desc: 'Definition, SVP and CVP problems, foundations for cryptography' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Learning‑with‑Errors problem on modules, foundation of ML‑KEM' },
        { number: 6, title: 'KEM (Key Encapsulation Mechanism)', desc: 'Structure and properties of a KEM, role in ML‑KEM' },
        { number: 7, title: 'NTT for Efficiency', desc: 'Number Theoretic Transform and fast ring multiplication' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Complete standard description, parameters and steps' },
        { number: 9, title: 'Security and Parameters', desc: 'Security levels, parameter selection and analysis' },
        { number: 10, title: 'Practical Implementations', desc: 'Code examples, optimizations and test vectors' }
    ],
    fr: [
        { number: 0, title: 'Mathématiques de base', desc: 'Anneaux, polynômes, arithmétique modulaire et corps finis' },
        { number: 1, title: 'Cryptographie symétrique', desc: 'Chiffrements à clé secrète, AES et modes d\'opération' },
        { number: 2, title: 'Cryptographie asymétrique', desc: 'RSA, échange de clés Diffie‑Hellman et signatures numériques' },
        { number: 3, title: 'Menace quantique', desc: 'Algorithme de Shor et impact sur RSA et ECC' },
        { number: 4, title: 'Treillis (lattices)', desc: 'Définition, problèmes SVP et CVP, bases pour la cryptographie' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Problème Learning‑with‑Errors sur modules, fondement de ML‑KEM' },
        { number: 6, title: 'KEM (Key Encapsulation Mechanism)', desc: 'Structure et propriétés d\'un KEM, rôle dans ML‑KEM' },
        { number: 7, title: 'NTT pour l\'efficacité', desc: 'Transformée de Théorie des Nombres et multiplication rapide dans les anneaux' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Description complète de la norme, paramètres et étapes' },
        { number: 9, title: 'Sécurité et paramètres', desc: 'Niveaux de sécurité, choix des paramètres et analyse' },
        { number: 10, title: 'Implémentations pratiques', desc: 'Exemples de code, optimisations et tests vectoriels' }
    ],
    de: [
        { number: 0, title: 'Grundlegende Mathematik', desc: 'Ringe, Polynome, modulare Arithmetik und endliche Körper' },
        { number: 1, title: 'Symmetrische Kryptographie', desc: 'Geheimschlüssel-Chiffren, AES und Betriebsarten' },
        { number: 2, title: 'Asymmetrische Kryptographie', desc: 'RSA, Diffie‑Hellman-Schlüsselaustausch und digitale Signaturen' },
        { number: 3, title: 'Quantenbedrohung', desc: 'Shors Algorithmus und Auswirkungen auf RSA und ECC' },
        { number: 4, title: 'Gitter (Lattices)', desc: 'Definition, SVP- und CVP-Probleme, Grundlagen für die Kryptographie' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Learning‑with‑Errors-Problem auf Modulen, Grundlage von ML‑KEM' },
        { number: 6, title: 'KEM (Key Encapsulation Mechanism)', desc: 'Struktur und Eigenschaften eines KEM, Rolle in ML‑KEM' },
        { number: 7, title: 'NTT für Effizienz', desc: 'Zahlentheoretische Transformation und schnelle Ringmultiplikation' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Vollständige Standardbeschreibung, Parameter und Schritte' },
        { number: 9, title: 'Sicherheit und Parameter', desc: 'Sicherheitsniveaus, Parameterauswahl und Analyse' },
        { number: 10, title: 'Praktische Implementierungen', desc: 'Codebeispiele, Optimierungen und Testvektoren' }
    ],
    es: [
        { number: 0, title: 'Matemáticas básicas', desc: 'Anillos, polinomios, aritmética modular y campos finitos' },
        { number: 1, title: 'Criptografía simétrica', desc: 'Cifrados de clave secreta, AES y modos de operación' },
        { number: 2, title: 'Criptografía asimétrica', desc: 'RSA, intercambio de claves Diffie‑Hellman y firmas digitales' },
        { number: 3, title: 'Amenaza cuántica', desc: 'Algoritmo de Shor e impacto en RSA y ECC' },
        { number: 4, title: 'Retículos (lattices)', desc: 'Definición, problemas SVP y CVP, bases para la criptografía' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Problema Learning‑with‑Errors en módulos, fundamento de ML‑KEM' },
        { number: 6, title: 'KEM (Key Encapsulation Mechanism)', desc: 'Estructura y propiedades de un KEM, papel en ML‑KEM' },
        { number: 7, title: 'NTT para eficiencia', desc: 'Transformada de Número Teórica y multiplicación rápida en anillos' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Descripción completa del estándar, parámetros y pasos' },
        { number: 9, title: 'Seguridad y parámetros', desc: 'Niveles de seguridad, selección de parámetros y análisis' },
        { number: 10, title: 'Implementaciones prácticas', desc: 'Ejemplos de código, optimizaciones y vectores de prueba' }
    ],
    pt: [
        { number: 0, title: 'Matemática básica', desc: 'Anéis, polinômios, aritmética modular e corpos finitos' },
        { number: 1, title: 'Criptografia simétrica', desc: 'Cifras de chave secreta, AES e modos de operação' },
        { number: 2, title: 'Criptografia assimétrica', desc: 'RSA, troca de chaves Diffie‑Hellman e assinaturas digitais' },
        { number: 3, title: 'Ameaça quântica', desc: 'Algoritmo de Shor e impacto no RSA e ECC' },
        { number: 4, title: 'Retículos (lattices)', desc: 'Definição, problemas SVP e CVP, bases para criptografia' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Problema Learning‑with‑Errors em módulos, fundamento do ML‑KEM' },
        { number: 6, title: 'KEM (Key Encapsulation Mechanism)', desc: 'Estrutura e propriedades de um KEM, papel no ML‑KEM' },
        { number: 7, title: 'NTT para eficiência', desc: 'Transformada de Número Teórica e multiplicação rápida em anéis' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Descrição completa do padrão, parâmetros e etapas' },
        { number: 9, title: 'Segurança e parâmetros', desc: 'Níveis de segurança, seleção de parâmetros e análise' },
        { number: 10, title: 'Implementações práticas', desc: 'Exemplos de código, otimizações e vetores de teste' }
    ],
    nl: [
        { number: 0, title: 'Basiswiskunde', desc: 'Ringen, polynomen, modulaire rekenkunde en eindige velden' },
        { number: 1, title: 'Symmetrische cryptografie', desc: 'Geheime-sleutelcodes, AES en werkingsmodi' },
        { number: 2, title: 'Asymmetrische cryptografie', desc: 'RSA, Diffie‑Hellman-sleuteluitwisseling en digitale handtekeningen' },
        { number: 3, title: 'Kwantumbedreiging', desc: 'Shor\'s algoritme en impact op RSA en ECC' },
        { number: 4, title: 'Roosters (lattices)', desc: 'Definitie, SVP- en CVP-problemen, grondslagen voor cryptografie' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Learning‑with‑Errors-probleem op modules, basis van ML‑KEM' },
        { number: 6, title: 'KEM (Key Encapsulation Mechanism)', desc: 'Structuur en eigenschappen van een KEM, rol in ML‑KEM' },
        { number: 7, title: 'NTT voor efficiëntie', desc: 'Getaltheoretische transformatie en snelle ringvermenigvuldiging' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Volledige standaardbeschrijving, parameters en stappen' },
        { number: 9, title: 'Beveiliging en parameters', desc: 'Beveiligingsniveaus, parameterkeuze en analyse' },
        { number: 10, title: 'Praktische implementaties', desc: 'Codevoorbeelden, optimalisaties en testvectoren' }
    ],
    ru: [
        { number: 0, title: 'Основная математика', desc: 'Кольца, многочлены, модульная арифметика и конечные поля' },
        { number: 1, title: 'Симметричная криптография', desc: 'Шифры с секретным ключом, AES и режимы работы' },
        { number: 2, title: 'Асимметричная криптография', desc: 'RSA, обмен ключами Диффи‑Хеллмана и цифровые подписи' },
        { number: 3, title: 'Квантовая угроза', desc: 'Алгоритм Шора и влияние на RSA и ECC' },
        { number: 4, title: 'Решётки (lattices)', desc: 'Определение, проблемы SVP и CVP, основы криптографии' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Проблема Learning‑with‑Errors на модулях, основа ML‑KEM' },
        { number: 6, title: 'KEM (Key Encapsulation Mechanism)', desc: 'Структура и свойства KEM, роль в ML‑KEM' },
        { number: 7, title: 'NTT для эффективности', desc: 'Теоретико-числовое преобразование и быстрое умножение в кольцах' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Полное описание стандарта, параметры и шаги' },
        { number: 9, title: 'Безопасность и параметры', desc: 'Уровни безопасности, выбор параметров и анализ' },
        { number: 10, title: 'Практические реализации', desc: 'Примеры кода, оптимизации и тестовые векторы' }
    ],
    zh: [
        { number: 0, title: '基础数学', desc: '环、多项式、模算术和有限域' },
        { number: 1, title: '对称密码学', desc: '秘密密钥密码、AES和操作模式' },
        { number: 2, title: '非对称密码学', desc: 'RSA、Diffie‑Hellman密钥交换和数字签名' },
        { number: 3, title: '量子威胁', desc: 'Shor算法及其对RSA和ECC的影响' },
        { number: 4, title: '格 (lattices)', desc: '定义、SVP和CVP问题、密码学基础' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: '模上的Learning‑with‑Errors问题，ML‑KEM的基础' },
        { number: 6, title: 'KEM (密钥封装机制)', desc: 'KEM的结构和属性，在ML‑KEM中的作用' },
        { number: 7, title: 'NTT提高效率', desc: '数论变换和快速环乘法' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: '完整标准描述、参数和步骤' },
        { number: 9, title: '安全性和参数', desc: '安全级别、参数选择和分析' },
        { number: 10, title: '实际实现', desc: '代码示例、优化和测试向量' }
    ],
    ja: [
        { number: 0, title: '基礎数学', desc: '環、多項式、モジュラー算術と有限体' },
        { number: 1, title: '対称暗号', desc: '秘密鍵暗号、AESと動作モード' },
        { number: 2, title: '非対称暗号', desc: 'RSA、Diffie‑Hellman鍵交換とデジタル署名' },
        { number: 3, title: '量子の脅威', desc: 'ShorのアルゴリズムとRSA・ECCへの影響' },
        { number: 4, title: '格子 (lattices)', desc: '定義、SVPとCVP問題、暗号の基礎' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'モジュール上のLearning‑with‑Errors問題、ML‑KEMの基盤' },
        { number: 6, title: 'KEM (鍵カプセル化メカニズム)', desc: 'KEMの構造と特性、ML‑KEMでの役割' },
        { number: 7, title: '効率のためのNTT', desc: '数論変換と高速環乗算' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: '完全な標準の説明、パラメータとステップ' },
        { number: 9, title: 'セキュリティとパラメータ', desc: 'セキュリティレベル、パラメータ選択と分析' },
        { number: 10, title: '実装例', desc: 'コード例、最適化とテストベクトル' }
    ],
    ko: [
        { number: 0, title: '기초 수학', desc: '환, 다항식, 모듈러 산술 및 유한체' },
        { number: 1, title: '대칭 암호화', desc: '비밀키 암호, AES 및 운영 모드' },
        { number: 2, title: '비대칭 암호화', desc: 'RSA, Diffie‑Hellman 키 교환 및 디지털 서명' },
        { number: 3, title: '양자 위협', desc: 'Shor 알고리즘과 RSA 및 ECC에 대한 영향' },
        { number: 4, title: '격자 (lattices)', desc: '정의, SVP 및 CVP 문제, 암호화 기초' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: '모듈의 Learning‑with‑Errors 문제, ML‑KEM의 기반' },
        { number: 6, title: 'KEM (키 캡슐화 메커니즘)', desc: 'KEM의 구조와 속성, ML‑KEM에서의 역할' },
        { number: 7, title: '효율성을 위한 NTT', desc: '수론적 변환과 빠른 환 곱셈' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: '완전한 표준 설명, 매개변수 및 단계' },
        { number: 9, title: '보안 및 매개변수', desc: '보안 수준, 매개변수 선택 및 분석' },
        { number: 10, title: '실제 구현', desc: '코드 예제, 최적화 및 테스트 벡터' }
    ],
    ar: [
        { number: 0, title: 'الرياضيات الأساسية', desc: 'الحلقات، متعددات الحدود، الحساب النمطي والحقول المنتهية' },
        { number: 1, title: 'التشفير المتماثل', desc: 'شفرات المفتاح السري، AES وطرق التشغيل' },
        { number: 2, title: 'التشفير غير المتماثل', desc: 'RSA، تبادل المفاتيح Diffie‑Hellman والتوقيعات الرقمية' },
        { number: 3, title: 'التهديد الكمي', desc: 'خوارزمية شور وتأثيرها على RSA و ECC' },
        { number: 4, title: 'الشبكات (lattices)', desc: 'التعريف، مشاكل SVP و CVP، أساسيات التشفير' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'مشكلة Learning‑with‑Errors على الوحدات، أساس ML‑KEM' },
        { number: 6, title: 'KEM (آلية تغليف المفاتيح)', desc: 'هيكل وخصائص KEM، الدور في ML‑KEM' },
        { number: 7, title: 'NTT للكفاءة', desc: 'تحويل النظرية العددية والضرب السريع في الحلقات' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'وصف كامل للمعيار، المعلمات والخطوات' },
        { number: 9, title: 'الأمان والمعلمات', desc: 'مستويات الأمان، اختيار المعلمات والتحليل' },
        { number: 10, title: 'التطبيقات العملية', desc: 'أمثلة على الكود، التحسينات ومتجهات الاختبار' }
    ],
    hi: [
        { number: 0, title: 'बुनियादी गणित', desc: 'रिंग, बहुपद, मॉड्यूलर अंकगणित और परिमित क्षेत्र' },
        { number: 1, title: 'सममित क्रिप्टोग्राफी', desc: 'गुप्त कुंजी सिफर, AES और ऑपरेशन मोड' },
        { number: 2, title: 'असममित क्रिप्टोग्राफी', desc: 'RSA, Diffie‑Hellman कुंजी विनिमय और डिजिटल हस्ताक्षर' },
        { number: 3, title: 'क्वांटम खतरा', desc: 'Shor का एल्गोरिदम और RSA एवं ECC पर प्रभाव' },
        { number: 4, title: 'जालक (lattices)', desc: 'परिभाषा, SVP और CVP समस्याएं, क्रिप्टोग्राफी के लिए आधार' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'मॉड्यूल पर Learning‑with‑Errors समस्या, ML‑KEM का आधार' },
        { number: 6, title: 'KEM (कुंजी एन्कैप्सुलेशन तंत्र)', desc: 'KEM की संरचना और गुण, ML‑KEM में भूमिका' },
        { number: 7, title: 'दक्षता के लिए NTT', desc: 'संख्या सैद्धांतिक रूपांतरण और तीव्र रिंग गुणन' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'पूर्ण मानक विवरण, पैरामीटर और चरण' },
        { number: 9, title: 'सुरक्षा और पैरामीटर', desc: 'सुरक्षा स्तर, पैरामीटर चयन और विश्लेषण' },
        { number: 10, title: 'व्यावहारिक कार्यान्वयन', desc: 'कोड उदाहरण, अनुकूलन और परीक्षण वेक्टर' }
    ],
    tr: [
        { number: 0, title: 'Temel Matematik', desc: 'Halkalar, polinomlar, modüler aritmetik ve sonlu alanlar' },
        { number: 1, title: 'Simetrik Kriptografi', desc: 'Gizli anahtar şifreleri, AES ve çalışma modları' },
        { number: 2, title: 'Asimetrik Kriptografi', desc: 'RSA, Diffie‑Hellman anahtar değişimi ve dijital imzalar' },
        { number: 3, title: 'Kuantum Tehdidi', desc: 'Shor algoritması ve RSA ile ECC üzerindeki etkisi' },
        { number: 4, title: 'Kafesler (lattices)', desc: 'Tanım, SVP ve CVP problemleri, kriptografi temelleri' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Modüller üzerinde Learning‑with‑Errors problemi, ML‑KEM\'in temeli' },
        { number: 6, title: 'KEM (Anahtar Kapsülleme Mekanizması)', desc: 'KEM\'in yapısı ve özellikleri, ML‑KEM\'deki rolü' },
        { number: 7, title: 'Verimlilik için NTT', desc: 'Sayı Teorik Dönüşüm ve hızlı halka çarpımı' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Tam standart açıklaması, parametreler ve adımlar' },
        { number: 9, title: 'Güvenlik ve Parametreler', desc: 'Güvenlik seviyeleri, parametre seçimi ve analiz' },
        { number: 10, title: 'Pratik Uygulamalar', desc: 'Kod örnekleri, optimizasyonlar ve test vektörleri' }
    ],
    pl: [
        { number: 0, title: 'Podstawy matematyki', desc: 'Pierścienie, wielomiany, arytmetyka modularna i ciała skończone' },
        { number: 1, title: 'Kryptografia symetryczna', desc: 'Szyfry z kluczem tajnym, AES i tryby działania' },
        { number: 2, title: 'Kryptografia asymetryczna', desc: 'RSA, wymiana kluczy Diffie‑Hellman i podpisy cyfrowe' },
        { number: 3, title: 'Zagrożenie kwantowe', desc: 'Algorytm Shora i wpływ na RSA oraz ECC' },
        { number: 4, title: 'Kraty (lattices)', desc: 'Definicja, problemy SVP i CVP, podstawy kryptografii' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Problem Learning‑with‑Errors na modułach, podstawa ML‑KEM' },
        { number: 6, title: 'KEM (Mechanizm Enkapsulacji Klucza)', desc: 'Struktura i właściwości KEM, rola w ML‑KEM' },
        { number: 7, title: 'NTT dla wydajności', desc: 'Teoretyczno-liczbowa transformata i szybkie mnożenie w pierścieniach' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Pełny opis standardu, parametry i kroki' },
        { number: 9, title: 'Bezpieczeństwo i parametry', desc: 'Poziomy bezpieczeństwa, wybór parametrów i analiza' },
        { number: 10, title: 'Praktyczne implementacje', desc: 'Przykłady kodu, optymalizacje i wektory testowe' }
    ],
    uk: [
        { number: 0, title: 'Базова математика', desc: 'Кільця, багаточлени, модульна арифметика та скінченні поля' },
        { number: 1, title: 'Симетрична криптографія', desc: 'Шифри з секретним ключем, AES та режими роботи' },
        { number: 2, title: 'Асиметрична криптографія', desc: 'RSA, обмін ключами Діффі‑Геллмана та цифрові підписи' },
        { number: 3, title: 'Квантова загроза', desc: 'Алгоритм Шора та вплив на RSA та ECC' },
        { number: 4, title: 'Ґратки (lattices)', desc: 'Визначення, проблеми SVP та CVP, основи криптографії' },
        { number: 5, title: 'MLWE (Module‑LWE)', desc: 'Проблема Learning‑with‑Errors на модулях, основа ML‑KEM' },
        { number: 6, title: 'KEM (Механізм Інкапсуляції Ключа)', desc: 'Структура та властивості KEM, роль у ML‑KEM' },
        { number: 7, title: 'NTT для ефективності', desc: 'Теоретико-числове перетворення та швидке множення в кільцях' },
        { number: 8, title: 'FIPS 203 / ML‑KEM', desc: 'Повний опис стандарту, параметри та кроки' },
        { number: 9, title: 'Безпека та параметри', desc: 'Рівні безпеки, вибір параметрів та аналіз' },
        { number: 10, title: 'Практичні реалізації', desc: 'Приклади коду, оптимізації та тестові вектори' }
    ]
};

let filteredChapters = [];
let currentPage = 0;
const chaptersPerPage = 6;

function getCurrentLang() {
    const parts = window.location.pathname.split('/');

    if (parts[3] && /^[a-z]{2}$/i.test(parts[3])) {
        return parts[3].toLowerCase();
    }

    return 'it';
}

// Ottieni i capitoli per la lingua
function getChaptersForLang(lang) {
    return chaptersData[lang] || chaptersData['en'];
}

// Inizializza i capitoli
function initChapters() {
    const lang = getCurrentLang();
    filteredChapters = [...getChaptersForLang(lang)];
    displayCurrentPage();
    updateNavigation();
}

// Filtra i capitoli
function filterChapters(query) {
    const lang = getCurrentLang();
    const normalized = query.trim().toLowerCase();
    const allChapters = getChaptersForLang(lang);
    
    if (!normalized) {
        filteredChapters = [...allChapters];
    } else {
        filteredChapters = allChapters.filter(ch =>
            ch.title.toLowerCase().includes(normalized) ||
            ch.desc.toLowerCase().includes(normalized)
        );
    }
    currentPage = 0;
    displayCurrentPage();
    updateNavigation();
}

// Imposta il selettore lingua
function setLanguageSelector(lang) {
    const sel = document.getElementById('langSelect');
    if (sel) sel.value = lang;
}


// Mostra la pagina corrente
function displayCurrentPage() {
    const grid = document.getElementById('chapterGrid');
    if (!grid) return;

    const lang = getCurrentLang();

    if (filteredChapters.length === 0) {
        const msg = (uiMessages[lang] || uiMessages['en']).noResults;
        grid.innerHTML = `<p class="loading-text">${msg}</p>`;
        return;
    }

    const start = currentPage * chaptersPerPage;
    const end = Math.min(start + chaptersPerPage, filteredChapters.length);
    const pageChapters = filteredChapters.slice(start, end);

    grid.innerHTML = pageChapters.map(ch => `
        <div class="book-card chapter-card" data-chapter="${ch.number}" data-lang="${lang}">
            <div class="chapter-number">${ch.number}</div>
            <div class="chapter-title">${ch.title}</div>
            <div class="chapter-desc">${ch.desc}</div>
        </div>
    `).join('');

    // Aggiungi l'effetto 3D e il click sulle card appena create
    setupChapterCards();
}

// Gestione del click sulle card dei capitoli
function setupChapterCards() {
    document.querySelectorAll('.chapter-card').forEach(card => {
        // Effetto 3D (come per le feature-card)
        const offset = 12;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const halfW = rect.width / 2;
            const halfH = rect.height / 2;
            const rotateY = ((x - halfW) / halfW) * offset * 0.4;
            const rotateX = ((halfH - y) / halfH) * offset * 0.4;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
            card.style.boxShadow = '0 40px 95px rgba(0,0,0,0.13)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });

        card.addEventListener('click', () => {
            const chapter = card.dataset.chapter;
            const lang = card.dataset.lang;
            const path = window.location.pathname;

            if (/\/docs\/[a-z]{2}\/?$/i.test(path) || /\/docs\/[a-z]{2}\//i.test(path)) {
                window.location.href = `${chapter}.html`;
            } else {
                window.location.href = `docs/${lang}/${chapter}.html`;
            }
        });
    });
}

// Aggiorna i pulsanti di navigazione
function updateNavigation() {
    const totalPages = Math.max(1, Math.ceil(filteredChapters.length / chaptersPerPage));
    const pageInfo = document.getElementById('pageInfo');
    if (pageInfo) {
        pageInfo.innerText = `${currentPage + 1} / ${totalPages}`;
    }
    document.getElementById('prevBtn').disabled = (currentPage === 0);
    document.getElementById('nextBtn').disabled = (currentPage >= totalPages - 1);
}

function nextChapters() {
    const totalPages = Math.ceil(filteredChapters.length / chaptersPerPage);
    if (currentPage < totalPages - 1) {
        currentPage++;
        displayCurrentPage();
        updateNavigation();
    }
}

function previousChapters() {
    if (currentPage > 0) {
        currentPage--;
        displayCurrentPage();
        updateNavigation();
    }
}

// Setup del campo di ricerca
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    searchInput.addEventListener('input', (e) => {
        filterChapters(e.target.value);
    });
}

function setupLanguageSelector() {
    const toggle = document.getElementById('langToggle');
    const dropdown = document.getElementById('langDropdown');
    const selector = document.getElementById('langSelector');
    const currentDisplay = document.getElementById('langCurrent');

    if (!toggle || !dropdown || !selector) return;

    // Mappa lingua → emoji + nome
    const langMap = {
        'it': '🇮🇹 Italiano',
        'en': '🇬🇧 English',
        'fr': '🇫🇷 Français',
        'de': '🇩🇪 Deutsch',
        'es': '🇪🇸 Español',
        'pt': '🇵🇹 Português',
        'nl': '🇳🇱 Nederlands',
        'ru': '🇷🇺 Русский',
        'zh': '🇨🇳 中文',
        'ja': '🇯🇵 日本語',
        'ko': '🇰🇷 한국어',
        'ar': '🇸🇦 العربية',
        'hi': '🇮🇳 हिन्दी',
        'tr': '🇹🇷 Türkçe',
        'pl': '🇵🇱 Polski',
        'uk': '🇺🇦 Українська'
    };

    // Ottieni la lingua corrente
    const currentLang = getCurrentLang();

    // Imposta il testo corrente
    if (currentDisplay && langMap[currentLang]) {
        currentDisplay.textContent = langMap[currentLang];
    }

    // Toggle apertura/chiusura dropdown
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        selector.classList.toggle('open');
    });

    // Click su un'opzione lingua
    dropdown.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = option.dataset.lang;
            if (lang && langMap[lang]) {
                window.location.href = `${window.location.origin}/public/docs/${lang}/index.html`;

            }
        });
    });

    // Chiudi il dropdown se si clicca fuori
    document.addEventListener('click', (e) => {
        if (!selector.contains(e.target)) {
            selector.classList.remove('open');
        }
    });

    // Chiudi con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && selector.classList.contains('open')) {
            selector.classList.remove('open');
        }
    });

    // Evidenzia l'opzione attiva nel dropdown
    dropdown.querySelectorAll('.lang-option').forEach(option => {
        if (option.dataset.lang === currentLang) {
            option.classList.add('active');
        }
    });
}

// Effetto 3D per le feature-card (già presente)
function setupFeatureMotion() {
    document.querySelectorAll('.feature-card').forEach(card => {
        const image = card.querySelector('.feature-image');
        const offset = Number(card.dataset.offset) || 14;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const halfW = rect.width / 2;
            const halfH = rect.height / 2;
            const rotateY = ((x - halfW) / halfW) * offset * 0.4;
            const rotateX = ((halfH - y) / halfH) * offset * 0.4;
            const translateX = ((x - halfW) / halfW) * 6;
            const translateY = ((y - halfH) / halfH) * 6;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            card.style.boxShadow = '0 40px 95px rgba(0,0,0,0.13)';
            if (image) {
                image.style.transform = `translateX(${translateX}px) translateY(${translateY}px) scale(1.04)`;
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
            if (image) {
                image.style.transform = '';
            }
        });
    });
}

// Scroll effects (roll-in, toolbar, squircle dot)
function setupScrollEffects() {
    // roll-in
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.roll-in-element').forEach(el => observer.observe(el));

    // squircle dot
    const squircle = document.querySelector('.squircle-dot');
    if (squircle) {
        const updateDot = () => {
            const drop = Math.min(window.scrollY * 0.15, 30);
            squircle.style.setProperty('--squircle-drop', `${drop}px`);
        };
        updateDot();
        window.addEventListener('scroll', updateDot, { passive: true });
    }
}

function setupHomeToolbar() {
    const toolbar = document.getElementById('homeToolbar');
    const hero = document.querySelector('.hero');
    if (!toolbar || !hero) return;
    const observer = new IntersectionObserver(([entry]) => {
        toolbar.classList.toggle('visible', !entry.isIntersecting);
    }, { threshold: 0, rootMargin: '-64px 0px 0px 0px' });
    observer.observe(hero);
}

// Inizializzazione al caricamento
document.addEventListener('DOMContentLoaded', () => {
    const lang = getCurrentLang();
    setLanguageSelector(lang);
    initChapters();
    setupSearch();
    setupLanguageSelector();
    setupFeatureMotion();
    setupScrollEffects();
    setupHomeToolbar();
});