-- ============================================================================
-- Peru Market ERP — Datos iniciales (seed) para Supabase
-- ----------------------------------------------------------------------------
-- Ejecuta este archivo DESPUÉS de schema.sql.
-- Datos convertidos de `perumarket_erp - origin.sql`. Incluye catálogos,
-- maestros y una muestra transaccional consistente con las claves foráneas.
-- ============================================================================

-- ---------- persona ----------
insert into public.persona (id, tipo_documento, numero_documento, nombres, apellido_paterno, apellido_materno, correo, telefono, fecha_nacimiento, direccion) values
(1,'DNI','12345678','Jean','Perez','Gomez','jean@perumarket.com','999888777','1990-05-15','Av. Lima 123'),
(2,'DNI','87654321','Maria','Lopez','Sanchez','maria@perumarket.com','999777666','1992-08-20','Av. Arequipa 456'),
(3,'DNI','11223344','Carlos','Rodriguez','Mendoza','carlos@perumarket.com','999666555','1988-12-10','Av. Tacna 789'),
(4,'DNI','74883636','Tonny','Hinostroza','Palaco','tonny21@gmail.com','946087678','2006-01-05','Lima'),
(5,'DNI','73457623','jean','ddd','chamorro','chamorrocg021@gmai.com','946087675','2025-12-04','Lima'),
(6,'DNI','75260852','José Adrian','Toribio','Toribio Barron','u22214417@utp.edu.pe','924215942',null,'ATE, San Gregorio'),
(7,'DNI','74883111','sssasasas','aaaaaa','saaa','chamorrocg021@gmai.com','946087675','2025-12-04','Lima'),
(8,'DNI','7389574','Caleb Cladimir','Veramendi','Alejos','caleb021@gmail.com','946087678','2006-01-18','Lima'),
(9,'DNI','74855874','c','jean','g','cg@gmail.com','987456321','2025-12-03','Lima - Ate'),
(10,'DNI','78956451','Nero','kk','kkk','nero@gmail.com','987456654','2025-11-01','Lima / Ate'),
(11,'DNI','748556321','jean','s','chamorro','chamorrocg021@gmai.com','+51946087675','2025-12-07','Lima'),
(13,'DNI','78498484','jean','aaaa','chamorro','chamorrocg021@gmai.com','+51946087675','2025-12-06','Lima'),
(14,'DNI','74883602','palsaaa','Jean','xxx','74883602@gmail.com','987456965','2025-12-04','Lima- Ate'),
(15,'DNI','74881212','jean','ssss','chamorro','chamorrocg021@gmai.com','946087675','2025-10-02','Lima'),
(16,'DNI','74855871','jean','sss','chamorro','chamorrocg021@gmai.com','946087675','2025-12-03','Lima'),
(17,'DNI','74883675','Jeanfranco','Chamorro','Granados','chamorrocg021@gmai.com','946087675',null,'Lima'),
(18,'DNI','74881234','jean','uuu','chamorro','chamorrocg021@gmai.com','946087675','2025-12-04','Lima'),
(19,'DNI','74881245','jean','y','chamorro','chamorrocg021@gmai.com','946087675','2025-12-01','Lima'),
(20,'DNI','','Tonny Gabriel','Hinostroza','Palaco','tonnyghp577@gmail.com','957302463','2005-08-27','av los robles'),
(21,'DNI','76318795','holiwi','asw','sAS','sJIVB@GMAIL.COM','','2000-06-14',''),
(22,'DNI','74541287','JHOSUA','A','S','J@GMAIL.COM','13121','1100-02-10','1AS'),
(23,'DNI','74315265','ASA','ASAAS','1QSASA','KIA@GMAIL.COM','9756321012','4000-07-15','asas'),
(24,'DNI','15789564','gia','s','s','gia@gmail.com','487563142','2000-12-05','sss'),
(25,'DNI','71212325','jhadira','ad','ad','jha@gmail.com','978654231','2006-09-05','aaaaaa'),
(26,null,null,null,null,null,null,null,null,null);

-- ---------- rol ----------
insert into public.rol (id, nombre, descripcion) values
(1,'Administrador','Acceso total al sistema'),
(2,'Vendedor','Acceso a módulos de ventas y clientes'),
(3,'Almacenero','Acceso a gestión de inventario'),
(6,'Cachinero','s'),
(7,'Marketing','xd');

-- ---------- modulo ----------
insert into public.modulo (id, nombre, descripcion, ruta) values
(1,'Dashboard','Panel principal del sistema','/dashboard'),
(2,'Accesos','Gestión de usuarios y permisos','/accesos'),
(3,'Ventas','Gestión de ventas y facturación','/ventas'),
(4,'Inventario','Control de stock y productos','/inventario'),
(5,'Compras','Gestión de compras y proveedores','/compras'),
(6,'Clientes','Gestión de clientes','/clientes'),
(7,'Reportes','Reportes y estadísticas','/reportes'),
(8,'Envios','Gestión de envíos y logística','/envios'),
(9,'Empleados','Gestión de empleados','/empleados'),
(10,'Proveedores','Gestión de proveedores','/proveedores'),
(11,'Pagina Web','Pagina','/xd'),
(12,'Detalle','ventas','/detalle');

-- ---------- categoria_producto ----------
insert into public.categoria_producto (id, nombre, descripcion) values
(1,'Electrónicos','Productos tecnológicos como laptops, celulares, teclados'),
(2,'Ropa','Prendas de vestir para hombres y mujeres'),
(3,'Accesorios','Accesorios varios como relojes, cadenas, pulseras'),
(4,'Hogar','Productos para el hogar y decoración'),
(5,'Juguetes','Juguetes para niños de todas las edades');

-- ---------- almacen ----------
insert into public.almacen (id, nombre, codigo, direccion, capacidad_m3, responsable, estado) values
(1,'ZZZ','u2322','Lima',22000.00,'jean','ACTIVO'),
(2,'FIBRE AIRS Professional','d-500','Avenida José Carlos Mariátegui',5000.00,'neritogey','ACTIVO'),
(3,'Los pollitos pio','358','Av. Grau 123 - Lima',200.00,'Jorge Andres Campo','ACTIVO');

-- ---------- departamento ----------
insert into public.departamento (id, nombre, descripcion) values
(1,'Ventas','Departamento de ventas y atención al cliente'),
(2,'Almacén','Departamento de gestión de inventario'),
(3,'Administración','Departamento administrativo y financiero'),
(4,'Logística','Departamento de envíos y distribución'),
(5,'Area de Sistemas','dev/ front / back / analist / full stack'),
(6,'rhhh','d');

-- ---------- metodo_pago ----------
insert into public.metodo_pago (id, nombre, descripcion, estado) values
(1,'EFECTIVO','Pago en efectivo','ACTIVO'),
(2,'TARJETA','Tarjeta de crédito/débito','ACTIVO'),
(3,'TRANSFERENCIA','Transferencia bancaria','ACTIVO'),
(4,'YAPE','Pago con Yape','ACTIVO'),
(5,'PLIN','Pago con Plin','ACTIVO'),
(6,'OTROS','Otros métodos','ACTIVO');

-- ---------- ruta ----------
insert into public.ruta (id, nombre, origen, destino, distancia_km, tiempo_estimado_horas, costo_base) values
(7,'Tarjeta video','ayacyucgi','taicaja',12.00,45.00,333.00);

-- ---------- vehiculo ----------
insert into public.vehiculo (id, placa, marca, modelo, capacidad_kg, estado) values
(1,'aji-849','Toyota','Hiace',null,'DISPONIBLE'),
(2,'AS-7841','Toyota','111',null,'MANTENIMIENTO'),
(3,'rot-456','Toyota','yaris',null,'DISPONIBLE'),
(8,'rot-455','kiua','adda',null,'DISPONIBLE'),
(9,'adsas','das','asdd',150.00,'DISPONIBLE'),
(10,'AF','ASF','AS',1500.00,'DISPONIBLE');

-- ---------- proveedor ----------
insert into public.proveedor (id, ruc, razon_social, contacto, telefono, correo, direccion, estado) values
(1,'20123456789','Distribuidora Los Andes S.A.C.','María López','987654321','contacto@losandes.com','Av. Grau 123 - Lima','ACTIVO'),
(2,'20567891234','Tecnología Global EIRL','Juan Pérez','945612378','ventas@tecnoglobal.pe','Calle Los Pinos 456 - Miraflores','ACTIVO');

-- ---------- cliente ----------
insert into public.cliente (id, id_persona, tipo, estado) values
(1,7,'NATURAL','INACTIVO'),
(2,10,'NATURAL','ACTIVO'),
(3,9,'NATURAL','INACTIVO'),
(12,19,'NATURAL','ACTIVO'),
(13,6,'JURIDICA','ACTIVO'),
(14,21,'NATURAL','ACTIVO'),
(15,22,'NATURAL','ACTIVO'),
(17,24,'NATURAL','ACTIVO');

-- ---------- conductor ----------
insert into public.conductor (id, id_persona, licencia, categoria_licencia, estado, nombres, apellido_paterno, apellido_materno, telefono, numero_documento) values
(1,26,'aiib',null,'','Toribio','DASDS','Barron','946087678','74885470'),
(2,26,'A78966459','AIIB','',null,null,null,null,null);

-- ---------- empleado ----------
insert into public.empleado (id, id_persona, departamento_id, puesto, sueldo, fecha_contratacion, foto, cv, estado) values
(2,9,5,'Cachinero',155.00,'2025-11-22','','AyS_s14.docx.pdf','ACTIVO'),
(4,5,6,'vf',1800.00,'2025-12-04','','comprobante_35.pdf','ACTIVO'),
(5,11,5,'develop',1500.00,'2025-12-05','','comprobante_27.pdf','ACTIVO');

-- ---------- usuario (password legacy; el login real es Supabase Auth) ----------
insert into public.usuario (id, id_persona, id_rol, username, password, estado) values
(1,1,1,'toribio','123456','ACTIVO'),
(2,2,2,'maria','12345678','ACTIVO'),
(4,4,1,'tonny123','tonnykbro','INACTIVO'),
(5,5,1,'jefferxd','pollitoxd','ACTIVO'),
(6,6,6,'toribioxd21','nero123','ACTIVO'),
(7,8,6,'calebxd','12345678','ACTIVO'),
(8,20,1,'tonny','admin123','ACTIVO');

-- ---------- role_module_permissions ----------
insert into public.role_module_permissions (id, id_rol, id_modulo, has_access) values
(35,1,1,true),(36,1,2,true),(37,1,3,true),(38,1,4,true),(39,1,5,true),(40,1,6,true),
(41,1,7,true),(42,1,8,true),(43,1,9,true),(44,1,10,true),(45,1,11,true),(46,1,12,true),
(47,2,3,true),(48,2,4,true),(49,2,5,true),(50,2,6,true),(51,2,12,true),
(52,3,1,true),(53,3,8,true),(54,3,10,true),
(55,7,1,true),(56,7,5,true),
(58,6,1,true),(59,6,2,true),(60,6,5,true);

-- ---------- producto ----------
insert into public.producto (id, nombre, descripcion, sku, precio_venta, precio_compra, stock, stock_minimo, stock_maximo, unidad_medida, peso_kg, imagen, categoria_id, requiere_codigo_barras, estado) values
(31,'Pelota',null,'PROV-149880',0.00,123.00,18,10,1000,'UNIDAD',123.000,null,1,true,'CATALOGO'),
(48,'arroz',null,'PROV-843723',0.00,20.00,2,10,1000,'UNIDAD',30.000,null,1,true,'CATALOGO'),
(49,'arroz',null,'PROV-873451',0.00,25.00,30,10,1000,'UNIDAD',35.000,null,1,true,'CATALOGO'),
(51,'relojes',null,'PROV-603980',0.00,30.00,56,10,1000,'UNIDAD',5.000,null,1,true,'CATALOGO'),
(52,'relojes','...............','RELO-8735',59.98,30.00,null,10,1000,'KG',5.000,null,2,true,'ACTIVO'),
(53,'relojes','aadada','RELO-1788',60.00,30.00,50,10,1000,'KG',5.000,null,1,true,'ACTIVO'),
(54,'carne',null,'PROV-998843',0.00,12.00,6,10,1000,'UNIDAD',2.000,null,1,true,'CATALOGO'),
(55,'carne','','CARN-8048',30.00,12.00,null,10,1000,'KG',2.000,null,1,true,'ACTIVO'),
(56,'arroz','','ARRO-3448',50.00,25.00,null,10,1000,'KG',35.000,null,4,true,'ACTIVO'),
(57,'relojes',null,'PROV-949562',0.00,20.00,10,10,1000,'UNIDAD',5.000,null,1,true,'CATALOGO'),
(58,'relojes','','RELO-5147',50.00,30.00,null,10,1000,'KG',5.000,null,1,true,'ACTIVO'),
(59,'relojes','','RELO-9707',31.99,30.00,null,10,1000,'KG',5.000,null,2,true,'ACTIVO'),
(60,'Tallarin Bells',null,'PROV-103786',0.00,25.00,41,10,1000,'UNIDAD',5.000,null,1,true,'CATALOGO'),
(61,'Tallarin Bells','11111111','TALL-BELL-7970',30.01,25.00,150,10,1000,'KG',5.000,null,3,true,'ACTIVO'),
(62,'carne','1212','CARN-5257',122.00,12.00,null,10,1000,'KG',2.000,null,2,true,'ACTIVO'),
(64,'Tallarin Bells','','TALL-BELL-2055',27.00,25.00,null,10,1000,'KG',5.000,null,1,true,'ACTIVO'),
(65,'Atun Gloria',null,'PROV-629815',0.00,2.50,40,10,1000,'UNIDAD',0.750,null,1,true,'CATALOGO'),
(66,'Atun Gloria','','ATUN-GLOR-3535',3.00,2.50,null,10,1000,'KG',0.750,null,4,true,'ACTIVO'),
(68,'pokemon',null,'PROV-711615',0.00,4.00,31,10,1000,'UNIDAD',1.000,null,1,true,'CATALOGO'),
(70,'LOMO SALTADO',null,'PROV-518540',0.00,15.00,36,10,1000,'UNIDAD',15.000,null,1,true,'CATALOGO'),
(72,'LOMO SALTADO','dfsfd','LOMO-SALT-5208',15.00,15.00,0,10,1000,'KG',15.000,null,1,true,'ACTIVO'),
(73,'PAPA HUAYRO','kg de papa','PROV-835365',18.00,25.00,1,10,1000,'UNIDAD',80.000,null,1,true,'ACTIVO');

-- ---------- codigo_barras ----------
insert into public.codigo_barras (id, codigo, id_producto, id_proveedor, tipo_codigo, descripcion, es_principal, unidades_por_codigo, estado) values
(37,'647876055445',52,1,'EAN13',null,true,1,'ACTIVO'),
(38,'688274104012',53,1,'EAN13',null,true,1,'ACTIVO'),
(39,'495874385580',55,2,'EAN13',null,true,1,'ACTIVO'),
(40,'514641740276',56,2,'EAN13',null,true,1,'ACTIVO'),
(41,'530437208357',58,2,'EAN13',null,true,1,'ACTIVO'),
(42,'610705445719',59,2,'EAN13',null,true,1,'ACTIVO'),
(43,'262107477664',61,1,'EAN13',null,true,1,'ACTIVO'),
(44,'445114012957',62,2,'EAN13',null,true,1,'ACTIVO'),
(45,'455391301211',64,1,'EAN13',null,true,1,'ACTIVO'),
(46,'907161161797',66,1,'EAN13',null,true,1,'ACTIVO'),
(50,'779547364672',72,1,'EAN13',null,true,1,'ACTIVO'),
(51,'800768269027',73,null,'EAN13',null,true,1,'ACTIVO');

-- ---------- proveedor_producto ----------
insert into public.proveedor_producto (id, id_proveedor, id_producto, precio_compra, tiempo_entrega_dias, es_principal) values
(49,2,49,25.00,null,true),(51,1,51,30.00,null,true),(52,1,52,30.00,null,true),
(53,1,53,30.00,null,true),(54,2,54,12.00,null,true),(55,2,55,12.00,null,true),
(56,2,56,25.00,null,true),(57,2,57,20.00,null,true),(58,2,58,30.00,null,true),
(59,2,59,30.00,null,true),(60,1,60,25.00,null,true),(61,1,61,25.00,null,true),
(62,2,62,12.00,null,true),(64,1,64,25.00,null,true),(65,1,65,2.50,null,true),
(66,1,66,2.50,null,true),(68,1,68,4.00,null,true),(70,1,70,15.00,null,true),
(72,1,72,15.00,null,true),(73,1,73,25.00,null,true);

-- ---------- inventario ----------
insert into public.inventario (id, id_producto, id_almacen, stock_actual, stock_minimo, stock_maximo, ubicacion) values
(40,52,1,6,10,1000,'ate'),(42,51,1,21,10,1000,null),(43,49,2,5,10,1000,null),
(44,53,1,10,10,1000,'ate'),(45,54,1,6,10,1000,null),(46,51,2,6,10,1000,null),
(47,55,1,6,1,5,'mi casa'),(48,56,2,5,10,1000,'mi casa'),(49,49,1,25,10,1000,null),
(50,57,1,10,10,1000,null),(51,58,1,26,10,1000,'mi casa'),(52,59,1,13,12,1000,''),
(53,53,2,50,10,1000,null),(54,60,1,41,10,1000,null),(55,61,1,24,10,1000,'12'),
(56,62,1,2,10,1000,'12'),(57,64,1,27,10,1000,''),(58,65,1,40,10,1000,null),
(59,66,1,5,10,20,''),(61,68,1,31,10,1000,null),(63,70,1,18,10,1000,null),
(65,72,1,77,10,1000,'15'),(66,70,2,18,10,1000,null),(67,61,2,150,10,1000,null),
(68,73,2,1,10,1000,'altillo');

-- ---------- compra ----------
insert into public.compra (id, id_proveedor, id_almacen, id_usuario, fecha, tipo_comprobante, numero_comprobante, subtotal, igv, total, estado, usa_codigo_barras, metodo_pago, observaciones) values
(32,1,1,1,'2025-12-22 01:44:34','ORDEN_COMPRA','OC01-367874',450.00,81.00,531.00,'COMPLETADA',false,'EFECTIVO',''),
(33,2,2,1,'2025-12-22 01:50:17','ORDEN_COMPRA','OC01-368217',125.00,22.50,147.50,'COMPLETADA',false,'EFECTIVO',''),
(34,2,1,1,'2025-12-22 02:03:39','ORDEN_COMPRA','OC01-369019',72.00,12.96,84.96,'COMPLETADA',false,'EFECTIVO',''),
(35,1,2,1,'2025-12-22 02:09:34','FACTURA','F001-369374',180.00,32.40,212.40,'COMPLETADA',false,'YAPE',''),
(36,2,1,1,'2025-12-23 01:01:15','BOLETA','B001-451675',250.00,45.00,295.00,'COMPLETADA',false,'EFECTIVO',''),
(37,2,1,1,'2025-12-23 01:02:20','FACTURA','F001-451740',375.00,67.50,442.50,'COMPLETADA',false,'EFECTIVO',''),
(38,1,1,1,'2025-12-23 01:22:01','ORDEN_COMPRA','OC01-452921',150.00,27.00,177.00,'COMPLETADA',false,'EFECTIVO',''),
(39,2,1,1,'2025-12-23 01:22:47','ORDEN_COMPRA','OC01-452967',200.00,36.00,236.00,'COMPLETADA',false,'EFECTIVO',''),
(40,1,2,1,'2025-12-23 20:50:29','BOLETA','B001-523029',1500.00,270.00,1770.00,'COMPLETADA',false,'YAPE',''),
(41,1,1,1,'2025-12-23 21:42:33','BOLETA','B001-526153',1000.00,180.00,1180.00,'COMPLETADA',false,'YAPE',''),
(42,1,1,1,'2025-12-24 03:04:40','BOLETA','B001-545480',25.00,4.50,29.50,'COMPLETADA',false,'YAPE',''),
(43,1,1,1,'2025-12-26 23:11:05','BOLETA','B001-790665',100.00,18.00,118.00,'COMPLETADA',false,'YAPE',''),
(44,1,1,1,'2025-12-29 03:25:45','ORDEN_COMPRA','OC01-978745',124.00,22.32,146.32,'COMPLETADA',false,'YAPE',''),
(45,1,1,1,'2026-02-01 20:25:40','BOLETA','B001-977539',270.00,48.60,318.60,'PENDIENTE',false,'TARJETA',''),
(46,1,2,1,'2026-02-01 20:33:53','FACTURA','F001-978033',270.00,48.60,318.60,'COMPLETADA',false,'TRANSFERENCIA',''),
(47,1,2,1,'2026-02-01 20:53:32','FACTURA','F001-979212',3750.00,675.00,4425.00,'COMPLETADA',false,'TRANSFERENCIA',''),
(48,1,2,1,'2026-02-01 21:04:14','ORDEN_COMPRA','OC01-979854',25.00,4.50,29.50,'COMPLETADA',false,'EFECTIVO','');

-- ---------- detalle_compra ----------
insert into public.detalle_compra (id, id_compra, id_producto, id_codigo_barras, cantidad, precio_unitario, subtotal, registrado_con_escaner) values
(32,32,51,null,15,30.00,450.00,false),(33,33,49,null,5,25.00,125.00,false),
(34,34,54,null,6,12.00,72.00,false),(35,35,51,null,6,30.00,180.00,false),
(36,36,49,null,10,25.00,250.00,false),(37,37,49,null,15,25.00,375.00,false),
(38,38,51,null,5,30.00,150.00,false),(39,39,57,null,10,20.00,200.00,false),
(40,40,53,null,50,30.00,1500.00,false),(41,41,60,null,40,25.00,1000.00,false),
(42,42,60,null,1,25.00,25.00,false),(43,43,65,null,40,2.50,100.00,false),
(44,44,68,null,31,4.00,124.00,false),(45,45,70,null,18,15.00,270.00,false),
(46,46,70,null,18,15.00,270.00,false),(47,47,61,null,150,25.00,3750.00,false),
(48,48,73,null,1,25.00,25.00,false);

-- ---------- venta ----------
insert into public.venta (id, id_cliente, id_usuario, id_almacen, fecha, subtotal, descuento_total, igv, total, estado) values
(1,1,1,1,'2025-11-29 04:57:57',15.00,0.00,2.70,17.70,'PENDIENTE'),
(2,2,1,1,'2025-12-02 04:38:18',24.60,0.00,4.43,29.03,'PENDIENTE'),
(3,2,1,1,'2025-12-02 04:39:17',24.60,0.00,5.40,5.40,'PENDIENTE'),
(12,12,1,1,'2025-12-06 06:45:16',24.60,0.00,5.40,30.00,'PENDIENTE'),
(13,13,5,1,'2025-12-21 23:08:35',41.00,0.00,9.00,50.00,'PENDIENTE'),
(22,13,5,1,'2025-12-22 00:59:38',245.92,0.00,53.98,299.90,'PENDIENTE'),
(46,13,8,1,'2025-12-27 05:55:34',2.46,0.00,0.54,3.00,'PENDIENTE'),
(47,2,8,1,'2025-12-27 05:56:12',9.84,0.00,2.16,12.00,'PENDIENTE'),
(48,13,8,1,'2025-12-27 06:04:23',2.46,0.00,0.54,3.00,'PENDIENTE'),
(49,13,8,1,'2025-12-27 06:14:41',49.20,0.00,10.80,60.00,'PENDIENTE'),
(50,12,8,1,'2025-12-27 22:35:36',52.44,0.00,11.54,63.98,'PENDIENTE'),
(51,2,8,1,'2025-12-28 04:45:53',2.46,0.00,0.54,3.00,'PENDIENTE'),
(52,12,8,1,'2025-12-29 22:51:25',288.52,0.00,63.48,352.00,'PENDIENTE'),
(53,2,8,1,'2025-12-29 23:40:26',124.60,0.00,27.41,152.01,'PENDIENTE'),
(54,2,8,1,'2025-12-29 23:42:03',124.60,0.00,27.41,152.01,'PENDIENTE'),
(55,12,8,1,'2025-12-29 23:54:27',52.44,0.00,11.54,63.98,'PENDIENTE'),
(56,12,8,1,'2025-12-29 23:56:41',52.44,0.00,11.54,63.98,'PENDIENTE'),
(57,12,8,1,'2025-12-29 23:57:01',26.22,0.00,5.77,31.99,'PENDIENTE'),
(58,12,8,1,'2025-12-30 00:01:16',52.44,0.00,11.54,63.98,'PENDIENTE'),
(59,14,8,1,'2025-12-30 00:52:46',196.79,0.00,43.29,240.08,'PENDIENTE'),
(60,12,8,1,'2025-12-30 01:36:11',157.33,0.00,34.61,191.94,'PENDIENTE'),
(61,17,8,1,'2025-12-30 02:57:19',196.66,0.00,43.26,239.92,'PENDIENTE'),
(62,2,8,1,'2026-02-01 22:26:23',12.30,0.00,2.70,15.00,'PENDIENTE'),
(63,2,8,1,'2026-02-01 22:27:01',86.10,0.00,18.90,105.00,'PENDIENTE');

-- ---------- detalle_venta ----------
insert into public.detalle_venta (id, id_venta, id_producto, id_codigo_barras, cantidad, precio_unitario, descuento, subtotal, registrado_con_escaner) values
(29,22,52,null,5,59.98,0.00,299.90,false),
(54,46,66,null,1,3.00,0.00,3.00,false),
(55,47,66,null,4,3.00,0.00,12.00,false),
(56,48,66,null,1,3.00,0.00,3.00,false),
(57,49,66,null,2,3.00,0.00,6.00,false),
(58,49,64,null,2,27.00,0.00,54.00,false),
(59,50,59,null,2,31.99,0.00,63.98,false),
(60,51,66,null,1,3.00,0.00,3.00,false),
(61,52,64,null,4,27.00,0.00,108.00,false),
(62,52,62,null,2,122.00,0.00,244.00,false),
(63,53,61,null,1,30.01,0.00,30.01,false),
(64,53,62,null,1,122.00,0.00,122.00,false),
(65,54,61,null,1,30.01,0.00,30.01,false),
(66,54,62,null,1,122.00,0.00,122.00,false),
(67,55,59,null,2,31.99,0.00,63.98,false),
(68,56,59,null,2,31.99,0.00,63.98,false),
(69,57,59,null,1,31.99,0.00,31.99,false),
(70,58,59,null,2,31.99,0.00,63.98,false),
(71,59,61,null,8,30.01,0.00,240.08,false),
(72,60,59,null,6,31.99,0.00,191.94,false),
(73,61,52,null,4,59.98,0.00,239.92,false),
(74,62,72,null,1,15.00,0.00,15.00,false),
(75,63,72,null,7,15.00,0.00,105.00,false);

-- ---------- pedido ----------
insert into public.pedido (id, id_cliente, id_venta, fecha_pedido, estado, total) values
(1,13,46,'2025-12-27 05:55:34','PENDIENTE',3.00),
(2,2,47,'2025-12-27 05:56:12','PENDIENTE',12.00),
(3,13,48,'2025-12-27 06:04:23','PENDIENTE',3.00),
(4,13,49,'2025-12-27 06:14:41','PENDIENTE',60.00),
(5,12,50,'2025-12-27 22:35:36','PENDIENTE',63.98),
(6,2,51,'2025-12-28 04:45:53','PENDIENTE',3.00),
(7,12,52,'2025-12-29 22:51:25','PENDIENTE',352.00),
(8,2,53,'2025-12-29 23:40:26','PENDIENTE',152.01),
(9,2,54,'2025-12-29 23:42:03','PENDIENTE',152.01),
(10,12,55,'2025-12-29 23:54:27','PENDIENTE',63.98),
(11,12,56,'2025-12-29 23:56:41','PENDIENTE',63.98),
(12,12,57,'2025-12-29 23:57:01','PENDIENTE',31.99),
(13,12,58,'2025-12-30 00:01:16','PENDIENTE',63.98),
(14,14,59,'2025-12-30 00:52:46','PENDIENTE',240.08),
(15,12,60,'2025-12-30 01:36:11','PENDIENTE',191.94),
(16,17,61,'2025-12-30 02:57:19','PENDIENTE',239.92);

-- ---------- envio ----------
insert into public.envio (id, id_pedido, id_venta, id_vehiculo, id_conductor, id_ruta, direccion_envio, fecha_envio, costo_transporte, estado, observaciones) values
(7,7,null,null,null,null,null,null,null,'PENDIENTE',null),
(8,11,null,null,null,null,null,'2025-12-29',null,'PENDIENTE',null),
(9,12,null,null,null,null,null,'2025-12-29',null,'PENDIENTE',null),
(10,13,null,null,null,null,null,'2025-12-29',null,'PENDIENTE',null),
(11,14,null,null,null,null,null,'2025-12-29',null,'PENDIENTE',null),
(12,15,null,null,null,null,null,'2025-12-29',null,'PENDIENTE',null),
(13,16,null,null,null,null,null,'2025-12-29',null,'PENDIENTE',null),
(14,null,3,null,null,null,'Lima','2026-02-01',15.00,'PENDIENTE',null),
(15,null,1,9,1,7,'Plaza 2 de Mayo, Cercado de Lima','2026-02-01',18.00,'PENDIENTE','asdads');

-- ============================================================================
-- RESET de secuencias (identity) para que los próximos INSERT no choquen
-- ============================================================================
select setval(pg_get_serial_sequence('public.persona','id'),                  (select max(id) from public.persona));
select setval(pg_get_serial_sequence('public.rol','id'),                      (select max(id) from public.rol));
select setval(pg_get_serial_sequence('public.modulo','id'),                   (select max(id) from public.modulo));
select setval(pg_get_serial_sequence('public.categoria_producto','id'),       (select max(id) from public.categoria_producto));
select setval(pg_get_serial_sequence('public.almacen','id'),                  (select max(id) from public.almacen));
select setval(pg_get_serial_sequence('public.departamento','id'),             (select max(id) from public.departamento));
select setval(pg_get_serial_sequence('public.metodo_pago','id'),              (select max(id) from public.metodo_pago));
select setval(pg_get_serial_sequence('public.ruta','id'),                     (select max(id) from public.ruta));
select setval(pg_get_serial_sequence('public.vehiculo','id'),                 (select max(id) from public.vehiculo));
select setval(pg_get_serial_sequence('public.proveedor','id'),                (select max(id) from public.proveedor));
select setval(pg_get_serial_sequence('public.cliente','id'),                  (select max(id) from public.cliente));
select setval(pg_get_serial_sequence('public.conductor','id'),               (select max(id) from public.conductor));
select setval(pg_get_serial_sequence('public.empleado','id'),                 (select max(id) from public.empleado));
select setval(pg_get_serial_sequence('public.usuario','id'),                  (select max(id) from public.usuario));
select setval(pg_get_serial_sequence('public.role_module_permissions','id'),  (select max(id) from public.role_module_permissions));
select setval(pg_get_serial_sequence('public.producto','id'),                 (select max(id) from public.producto));
select setval(pg_get_serial_sequence('public.codigo_barras','id'),            (select max(id) from public.codigo_barras));
select setval(pg_get_serial_sequence('public.proveedor_producto','id'),       (select max(id) from public.proveedor_producto));
select setval(pg_get_serial_sequence('public.inventario','id'),               (select max(id) from public.inventario));
select setval(pg_get_serial_sequence('public.compra','id'),                   (select max(id) from public.compra));
select setval(pg_get_serial_sequence('public.detalle_compra','id'),           (select max(id) from public.detalle_compra));
select setval(pg_get_serial_sequence('public.venta','id'),                    (select max(id) from public.venta));
select setval(pg_get_serial_sequence('public.detalle_venta','id'),            (select max(id) from public.detalle_venta));
select setval(pg_get_serial_sequence('public.pedido','id'),                   (select max(id) from public.pedido));
select setval(pg_get_serial_sequence('public.envio','id'),                    (select max(id) from public.envio));
