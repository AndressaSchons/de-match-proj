const TZ = "America/Sao_Paulo";

const MES_LABEL = /** @type {const} */ ([
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
]);

/** @param {Date} d */
function yearMonthInTz(d) {
  const year = Number(d.toLocaleString("en-US", { timeZone: TZ, year: "numeric" }));
  const month = Number(d.toLocaleString("en-US", { timeZone: TZ, month: "numeric" }));
  return { year, month };
}

/** @param {string | Date | null | undefined} value */
function parseDate(value) {
  if (value == null || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {Array<string | Date | null | undefined>} datas
 * @returns {{
 *   totalGeral: number,
 *   anoReferencia: number,
 *   porAno: Array<{ ano: number, total: number }>,
 *   porMesAnoAtual: Array<{ mes: number, label: string, total: number }>,
 * }}
 */
export function aggregateAdocaoMetrics(datas) {
  const now = new Date();
  const { year: anoReferencia, month: mesAtual } = yearMonthInTz(now);

  /** @type {Record<number, number>} */
  const byYear = {};
  /** @type {Record<number, number>} */
  const byMonthCurrentYear = {};

  for (const raw of datas) {
    const d = parseDate(raw);
    if (!d) continue;

    const { year, month } = yearMonthInTz(d);
    byYear[year] = (byYear[year] ?? 0) + 1;

    if (year === anoReferencia) {
      byMonthCurrentYear[month] = (byMonthCurrentYear[month] ?? 0) + 1;
    }
  }

  const porAno = Object.entries(byYear)
    .map(([ano, total]) => ({ ano: Number(ano), total }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.ano - a.ano);

  const porMesAnoAtual = [];
  for (let mes = 1; mes <= mesAtual; mes++) {
    const total = byMonthCurrentYear[mes] ?? 0;
    if (total === 0) continue;
    porMesAnoAtual.push({
      mes,
      label: MES_LABEL[mes - 1] ?? String(mes),
      total,
    });
  }

  const totalGeral = porAno.reduce((acc, x) => acc + x.total, 0);

  return { totalGeral, anoReferencia, porAno, porMesAnoAtual };
}
