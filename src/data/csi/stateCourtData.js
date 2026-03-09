/**
 * State Courts Data - Nigeria
 * Covers State High Courts and Magistrate Courts across 36 states + FCT.
 *
 * Lagos State High Court divisions sourced from:
 * https://lagosjudiciary.gov.ng/ViewDivisions.aspx
 *
 * For other states, divisions and judges are managed in the backend and
 * fetched via API. Add static data here as it becomes available.
 */

export const NIGERIAN_STATES_LIST = [
  { id: 'abia',       name: 'Abia',        capital: 'Umuahia',      stateCode: 'AB' },
  { id: 'adamawa',    name: 'Adamawa',     capital: 'Yola',         stateCode: 'AD' },
  { id: 'akwa-ibom',  name: 'Akwa Ibom',   capital: 'Uyo',          stateCode: 'AK' },
  { id: 'anambra',    name: 'Anambra',     capital: 'Awka',         stateCode: 'AN' },
  { id: 'bauchi',     name: 'Bauchi',      capital: 'Bauchi',       stateCode: 'BA' },
  { id: 'bayelsa',    name: 'Bayelsa',     capital: 'Yenagoa',      stateCode: 'BY' },
  { id: 'benue',      name: 'Benue',       capital: 'Makurdi',      stateCode: 'BE' },
  { id: 'borno',      name: 'Borno',       capital: 'Maiduguri',    stateCode: 'BO' },
  { id: 'cross-river', name: 'Cross River', capital: 'Calabar',     stateCode: 'CR' },
  { id: 'delta',      name: 'Delta',       capital: 'Asaba',        stateCode: 'DE' },
  { id: 'ebonyi',     name: 'Ebonyi',      capital: 'Abakaliki',    stateCode: 'EB' },
  { id: 'edo',        name: 'Edo',         capital: 'Benin City',   stateCode: 'ED' },
  { id: 'ekiti',      name: 'Ekiti',       capital: 'Ado-Ekiti',    stateCode: 'EK' },
  { id: 'enugu',      name: 'Enugu',       capital: 'Enugu',        stateCode: 'EN' },
  { id: 'fct',        name: 'FCT Abuja',   capital: 'Abuja',        stateCode: 'FC' },
  { id: 'gombe',      name: 'Gombe',       capital: 'Gombe',        stateCode: 'GO' },
  { id: 'imo',        name: 'Imo',         capital: 'Owerri',       stateCode: 'IM' },
  { id: 'jigawa',     name: 'Jigawa',      capital: 'Dutse',        stateCode: 'JI' },
  { id: 'kaduna',     name: 'Kaduna',      capital: 'Kaduna',       stateCode: 'KD' },
  { id: 'kano',       name: 'Kano',        capital: 'Kano',         stateCode: 'KN' },
  { id: 'katsina',    name: 'Katsina',     capital: 'Katsina',      stateCode: 'KT' },
  { id: 'kebbi',      name: 'Kebbi',       capital: 'Birnin-Kebbi', stateCode: 'KE' },
  { id: 'kogi',       name: 'Kogi',        capital: 'Lokoja',       stateCode: 'KO' },
  { id: 'kwara',      name: 'Kwara',       capital: 'Ilorin',       stateCode: 'KW' },
  { id: 'lagos',      name: 'Lagos',       capital: 'Ikeja',        stateCode: 'LA', hcStatus: 'active',  magStatus: 'active'  },
  { id: 'nasarawa',   name: 'Nasarawa',    capital: 'Lafia',        stateCode: 'NA' },
  { id: 'niger',      name: 'Niger',       capital: 'Minna',        stateCode: 'NI' },
  { id: 'ogun',       name: 'Ogun',        capital: 'Abeokuta',     stateCode: 'OG' },
  { id: 'ondo',       name: 'Ondo',        capital: 'Akure',        stateCode: 'ON' },
  { id: 'osun',       name: 'Osun',        capital: 'Osogbo',       stateCode: 'OS' },
  { id: 'oyo',        name: 'Oyo',         capital: 'Ibadan',       stateCode: 'OY' },
  { id: 'plateau',    name: 'Plateau',     capital: 'Jos',          stateCode: 'PL' },
  { id: 'rivers',     name: 'Rivers',      capital: 'Port Harcourt', stateCode: 'RI', hcStatus: 'partial', magStatus: 'partial' },
  { id: 'sokoto',     name: 'Sokoto',      capital: 'Sokoto',       stateCode: 'SO' },
  { id: 'taraba',     name: 'Taraba',      capital: 'Jalingo',      stateCode: 'TA' },
  { id: 'yobe',       name: 'Yobe',        capital: 'Damaturu',     stateCode: 'YO' },
  { id: 'zamfara',    name: 'Zamfara',     capital: 'Gusau',        stateCode: 'ZA' },
]

/**
 * Lagos State High Court — Specialized Divisions
 * Source: https://lagosjudiciary.gov.ng/ViewDivisions.aspx
 *
 * Each entry represents one specialized court within its judicial division.
 * Each judge is listed under the court in which they sit.
 */
export const STATE_HC_DIVISIONS = {
  lagos: [
    // ── IKEJA JUDICIAL DIVISION ──────────────────────────────────────────
    {
      id: 'ikeja-general-civil',
      name: 'General Civil Division',
      parentDivision: 'Ikeja Judicial Division',
      judges: [
        { id: 'lag-hc-1',  name: 'Hon. Justice K.O. Alogba' },
        { id: 'lag-hc-2',  name: 'Hon. Justice O.A. Ipaye (Mrs.)' },
        { id: 'lag-hc-3',  name: 'Hon. Justice L.B. Lawal-Akapo' },
        { id: 'lag-hc-4',  name: 'Hon. Justice L.A.F. Oluyemi' },
        { id: 'lag-hc-5',  name: 'Hon. Justice L.A.M. Folami' },
        { id: 'lag-hc-6',  name: 'Hon. Justice Y.R. Pinheiro' },
        { id: 'lag-hc-7',  name: 'Hon. Justice D.T. Olatokun' },
      ],
    },
    {
      id: 'ikeja-lands',
      name: 'Lands Division',
      parentDivision: 'Ikeja Judicial Division',
      judges: [
        { id: 'lag-hc-8',  name: 'Hon. Justice R.I.B. Adebiyi' },
        { id: 'lag-hc-9',  name: 'Hon. Justice M.O. Obadina' },
        { id: 'lag-hc-10', name: 'Hon. Justice M.A. Savage' },
        { id: 'lag-hc-11', name: 'Hon. Justice S.S. Ogunsanya' },
        { id: 'lag-hc-12', name: 'Hon. Justice A.M. Lawal' },
        { id: 'lag-hc-13', name: 'Hon. Justice Y.G. Oshoala' },
        { id: 'lag-hc-14', name: 'Hon. Justice O.A. Odunsanya' },
      ],
    },
    {
      id: 'ikeja-family-probate',
      name: 'Family and Probate Division',
      parentDivision: 'Ikeja Judicial Division',
      judges: [
        { id: 'lag-hc-15', name: 'Hon. Justice C.O. Balogun' },
        { id: 'lag-hc-16', name: 'Hon. Justice O.I. Oguntade' },
        { id: 'lag-hc-17', name: 'Hon. Justice A.O. Adeyemi' },
        { id: 'lag-hc-18', name: 'Hon. Justice O.J. Awope' },
      ],
    },
    {
      id: 'ikeja-criminal',
      name: 'Criminal Division',
      parentDivision: 'Ikeja Judicial Division',
      judges: [
        { id: 'lag-hc-19', name: 'Hon. Justice A.J. Coker (Mrs.)' },
        { id: 'lag-hc-20', name: 'Hon. Justice H.O. Oshodi' },
        { id: 'lag-hc-21', name: 'Hon. Justice O.O.A. Fadipe' },
        { id: 'lag-hc-22', name: 'Hon. Justice O.A. Ogala' },
        { id: 'lag-hc-23', name: 'Hon. Justice I.O. Ijelu' },
      ],
    },
    {
      id: 'ikeja-special-offences',
      name: 'Special Offences Court (Economic Crimes)',
      parentDivision: 'Ikeja Judicial Division',
      judges: [
        { id: 'lag-hc-24', name: 'Hon. Justice M.A. Dada (Mrs.)' },
        { id: 'lag-hc-25', name: 'Hon. Justice R.A. Oshodi' },
      ],
    },
    {
      id: 'ikeja-sexual-offences',
      name: 'Sexual Offences Court',
      parentDivision: 'Ikeja Judicial Division',
      judges: [
        { id: 'lag-hc-26', name: 'Hon. Justice A.O. Soladoye' },
        { id: 'lag-hc-27', name: 'Hon. Justice O.A. Okunuga' },
      ],
    },

    // ── LAGOS JUDICIAL DIVISION ──────────────────────────────────────────
    {
      id: 'lagos-general-civil',
      name: 'General Civil Division',
      parentDivision: 'Lagos Judicial Division',
      judges: [
        { id: 'lag-hc-28', name: 'Hon. Justice T.A.O. Oyekan-Abdullai (Mrs.)' },
        { id: 'lag-hc-29', name: 'Hon. Justice J.E. Oyefeso' },
        { id: 'lag-hc-30', name: 'Hon. Justice A.O. Opesanwo' },
        { id: 'lag-hc-31', name: 'Hon. Justice G.A. Safari' },
        { id: 'lag-hc-32', name: 'Hon. Justice O.O. Ogungbesan' },
        { id: 'lag-hc-33', name: 'Hon. Justice I.E. Alakija' },
        { id: 'lag-hc-34', name: 'Hon. Justice O. Sule-Amzat' },
        { id: 'lag-hc-35', name: 'Hon. Justice F.O. Aigbokaevbo' },
        { id: 'lag-hc-36', name: 'Hon. Justice O.A. Oresanya' },
      ],
    },
    {
      id: 'lagos-lands',
      name: 'Lands Division',
      parentDivision: 'Lagos Judicial Division',
      judges: [
        { id: 'lag-hc-37', name: 'Hon. Justice O.A. Akinlade' },
        { id: 'lag-hc-38', name: 'Hon. Justice O.O. Ogunjobi' },
        { id: 'lag-hc-39', name: 'Hon. Justice E.O. Ashade' },
      ],
    },
    {
      id: 'lagos-family-probate',
      name: 'Family and Probate Division',
      parentDivision: 'Lagos Judicial Division',
      judges: [
        { id: 'lag-hc-40', name: 'Hon. Justice A.A. Oyebanji' },
        { id: 'lag-hc-41', name: 'Hon. Justice C.A. Balogun' },
      ],
    },
    {
      id: 'lagos-fast-track',
      name: 'Fast Track Division',
      parentDivision: 'Lagos Judicial Division',
      judges: [
        { id: 'lag-hc-42', name: 'Hon. Justice O.O. Pedro' },
        { id: 'lag-hc-43', name: 'Hon. Justice L.A. Okunnu' },
        { id: 'lag-hc-44', name: 'Hon. Justice K.A. Jose (Mrs.)' },
        { id: 'lag-hc-45', name: 'Hon. Justice A.A. Akintoye' },
        { id: 'lag-hc-46', name: 'Hon. Justice R.O. Olukolu' },
        { id: 'lag-hc-47', name: 'Hon. Justice A.M. Ipaye-Nwachukwu' },
      ],
    },
    {
      id: 'lagos-criminal',
      name: 'Criminal Division',
      parentDivision: 'Lagos Judicial Division',
      judges: [
        { id: 'lag-hc-48', name: 'Hon. Justice A.M. Nicol-Clay' },
        { id: 'lag-hc-49', name: 'Hon. Justice Y.A. Adesanya' },
        { id: 'lag-hc-50', name: 'Hon. Justice I.O. Harrison' },
        { id: 'lag-hc-51', name: 'Hon. Justice S.I. Sonaike' },
      ],
    },
    {
      id: 'eti-osa',
      name: 'Eti-Osa Division',
      parentDivision: 'Lagos Judicial Division',
      judges: [
        { id: 'lag-hc-52', name: 'Hon. Justice M.O. Obadina' },
        { id: 'lag-hc-53', name: 'Hon. Justice W. Animahun' },
      ],
    },

    // ── BADAGRY JUDICIAL DIVISION ────────────────────────────────────────
    {
      id: 'badagry',
      name: 'Badagry Judicial Division',
      parentDivision: 'Badagry Judicial Division',
      judges: [
        { id: 'lag-hc-54', name: 'Hon. Justice O.A. Adamson' },
        { id: 'lag-hc-55', name: 'Hon. Justice E.O. Ogundare' },
        { id: 'lag-hc-56', name: 'Hon. Justice M.O. Dawodu' },
      ],
    },

    // ── IKORODU JUDICIAL DIVISION ────────────────────────────────────────
    {
      id: 'ikorodu',
      name: 'Ikorodu Judicial Division',
      parentDivision: 'Ikorodu Judicial Division',
      judges: [
        { id: 'lag-hc-57', name: 'Hon. Justice I.O. Akinkugbe' },
        { id: 'lag-hc-58', name: 'Hon. Justice A.F. Pokanu' },
        { id: 'lag-hc-59', name: 'Hon. Justice M.I. Oshodi' },
      ],
    },

    // ── EPE JUDICIAL DIVISION ────────────────────────────────────────────
    {
      id: 'epe',
      name: 'Epe Judicial Division',
      parentDivision: 'Epe Judicial Division',
      judges: [
        { id: 'lag-hc-60', name: 'Hon. Justice W.A. Animahun' },
        { id: 'lag-hc-61', name: 'Hon. Justice S.A. Olaitan' },
      ],
    },
  ],

  fct: [
    {
      id: 'abuja-hc',
      name: 'FCT High Court',
      parentDivision: 'Abuja High Court',
      judges: [],
    },
  ],

  rivers: [
    {
      id: 'port-harcourt-hc',
      name: 'Port Harcourt Division',
      parentDivision: 'Port Harcourt Judicial Division',
      judges: [],
    },
  ],
}

/**
 * Magistrate Court Divisions
 */
export const MAGISTRATE_DIVISIONS = {
  lagos: [
    { id: 'lagos-island-mag', name: 'Lagos Island Magistrate Court',  location: 'Lagos Island' },
    { id: 'ikeja-mag',        name: 'Ikeja Magistrate Court',          location: 'Ikeja' },
    { id: 'badagry-mag',      name: 'Badagry Magistrate Court',        location: 'Badagry' },
    { id: 'epe-mag',          name: 'Epe Magistrate Court',            location: 'Epe' },
    { id: 'ikorodu-mag',      name: 'Ikorodu Magistrate Court',        location: 'Ikorodu' },
    { id: 'yaba-mag',         name: 'Yaba Magistrate Court',           location: 'Yaba' },
  ],
  fct: [
    { id: 'abuja-mag',        name: 'Abuja Magistrate Court',          location: 'FCT Abuja' },
    { id: 'bwari-mag',        name: 'Bwari Magistrate Court',          location: 'Bwari' },
    { id: 'gwagwalada-mag',   name: 'Gwagwalada Magistrate Court',     location: 'Gwagwalada' },
    { id: 'kuje-mag',         name: 'Kuje Magistrate Court',           location: 'Kuje' },
  ],
  rivers: [
    { id: 'ph-mag',           name: 'Port Harcourt Magistrate Court',  location: 'Port Harcourt' },
  ],
}

export const getStateHCDivisions = (stateId) => STATE_HC_DIVISIONS[stateId] || []
export const getMagistrateDivisions = (stateId) => MAGISTRATE_DIVISIONS[stateId] || []
export const getState = (stateId) => NIGERIAN_STATES_LIST.find((s) => s.id === stateId)
