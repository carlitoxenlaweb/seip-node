SEIP NodeJS
========================

Servidor (script) para *sincronizar y replicar* los cambios realizados en la base maestra hacia el resto de los servidores. 

#### TODO:

- [x] Crear el listener para los archivos de la carpeta
- [x] Conectar con los servidores en el arranque
- [x] Replicar el archivo .log para cada servidor
- [x] Convertir archivo a cadena SQL
- [ ] Crear vistas y controles
- [ ] Agregar soporte para editar servidor en tiempo de ejecucion

#### Enlaces:

- [Dependencias](#dependencias)
- [Estructura](#estructura)
- [Archivos Modificados](#archivos-modificados)


Dependencias
----------------------------------

```
"async": "^1.5.2",
"body-parser": "~1.13.2",
"colors": "^1.1.2",
"cookie-parser": "~1.3.5",
"csvtojson": "^0.5.2",
"debug": "~2.2.0",
"express": "~4.13.1",
"jade": "~1.11.0",
"morgan": "~1.6.1",
"mysql": "^2.10.2",
"serve-favicon": "~2.3.0"
```


Estructura
-------------------------------------

## ./bin/app.cnf

```json
{
	"log_path": "/path/to/masterlog/",
	"table_name_a": {
		"primary": "primary_key",
		"fields": [
			"field_a",
			"field_b",
			"field_c"
		]
	},
	"table_name_b": {
		"primary": "primary_a|index_b|key_c",
		"fields": [
			"field_a",
			"field_b",
			"field_c"
		]
	},
	"servers": {
		"param_conn_a": {
			"host": "127.0.0.1",
			"port": 3306,
			"user": "root",
			"pass": "123456",
			"dbname": "seip"
		},
		"param_conn_b": {
			"host": "172.20.124.99",
			"port": 3306,
			"user": "root",
			"pass": "12345",
			"dbname": "seip"
		}
	}
}
```

El servidor maestro **no ha de agregarse** ya que los querys son cargados desde su BD. **_log\_path_** corresponde a la carpeta donde se generan los scripts del trigger.