// Mismos datos que los archivos de práctica de Excel (carpeta material_excel/practicas).
export const gastos: [string, string, number][] = [['Alquiler', 'Vivienda', 1500000], ['Luz (ANDE)', 'Servicios', 180000], ['Agua', 'Servicios', 60000], ['Internet', 'Servicios', 150000], ['Supermercado', 'Alimentos', 900000], ['Transporte', 'Movilidad', 250000], ['Celular', 'Servicios', 80000], ['Salidas', 'Ocio', 200000]];
export const alumnos: [string, number, number, number][] = [['Ana Benítez', 78, 85, 90], ['Bruno Gómez', 55, 62, 48], ['Carla Duarte', 92, 88, 95], ['Diego Ferreira', 60, 58, 70], ['Elena Giménez', 45, 50, 52], ['Fabián López', 81, 79, 85], ['Gloria Martínez', 66, 72, 64], ['Hugo Núñez', 38, 44, 40]];
export const items: [string, number, number][] = [['Cuaderno', 5, 12000], ['Caja de lápices', 3, 18000], ['Mochila', 1, 150000], ['Resma de papel', 2, 45000]];
export const fiesta: [string, number, number][] = [['Gaseosa', 12, 9000], ['Hamburguesa', 20, 15000], ['Torta', 1, 120000], ['Globos', 3, 8000], ['Descartables', 4, 10000]];
export const precios: [string, string, number][] = [['Mouse', 'Accesorios', 60000], ['Teclado', 'Accesorios', 120000], ['Pendrive', 'Accesorios', 50000], ['Monitor', 'Equipos', 900000], ['Impresora', 'Equipos', 800000], ['Notebook', 'Equipos', 3500000]];
export const ventas: [string, string, string, number][] = [
  ['02/03/2026', 'Ana', 'Mouse', 5], ['02/03/2026', 'Luis', 'Notebook', 1], ['03/03/2026', 'María', 'Teclado', 3], ['03/03/2026', 'Ana', 'Monitor', 2],
  ['04/03/2026', 'Luis', 'Pendrive', 10], ['04/03/2026', 'María', 'Impresora', 1], ['05/03/2026', 'Ana', 'Notebook', 2], ['05/03/2026', 'Luis', 'Mouse', 4],
  ['06/03/2026', 'María', 'Monitor', 1], ['06/03/2026', 'Ana', 'Teclado', 2], ['09/03/2026', 'Luis', 'Impresora', 2], ['09/03/2026', 'María', 'Pendrive', 6],
  ['10/03/2026', 'Ana', 'Impresora', 1], ['10/03/2026', 'Luis', 'Monitor', 1], ['11/03/2026', 'María', 'Notebook', 1], ['11/03/2026', 'Ana', 'Pendrive', 8]];
const pr = Object.fromEntries(precios.map(([n, c, p]) => [n, { c, p }]));
export const ventasCalc = ventas.map(([f, v, p, q]) => ({ fecha: f, vendedor: v, producto: p, cantidad: q, categoria: pr[p].c, precio: pr[p].p, total: q * pr[p].p, comision: q * pr[p].p >= 1000000 ? q * pr[p].p * 0.05 : q * pr[p].p * 0.02 }));
export const promedios = alumnos.map(([, a, b, c]) => (a + b + c) / 3);
export const totales = alumnos.map(([, a, b, c]) => a + b + c);
export const porVendedor = (v: string) => ventasCalc.filter((x) => x.vendedor === v);
export const gs = (n: number) => new Intl.NumberFormat('es-PY', { maximumFractionDigits: 0 }).format(Math.round(n));
