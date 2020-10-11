

	/* 
	 * Schieberegler
	 * -------------
	 * 
	 * Script:        nSchieberegler
	 * 
	 * Version:       1.1
	 * Release:       01.05.2020
	 * 
	 * Author:        numaek   
	 * Copyright (c): 2004-2020 by www.numaek.de
	 * 
	 * *************************************************************************************************************************************************************************************
	 */


	function Schieberegler(ID)
	{
		/*
		 * 
		 * Im HTML - die Canvas-Fläche darstellen, mit ID und Abmessungen:
		 * ===============================================================
		 * <canvas id="meinSchieber_1" width="200" height="60" style="border: 0px solid #808080;"></canvas>
		 * 
		 * 
		 * Im Javascript - den Regler parametrieren:
		 * =========================================
		 * meinRegler = new Schieberegler('DmeinSchieber_1');	// Neuen Regler vorbereiten
		 * 
		 * meinRegler.configSet('start',       50);		// Konfiguration bearbeiten (Liste siehe unten)
		 * meinRegler.configSet('str_farbe',  'red');		// Konfiguration bearbeiten, etc...
		 * meinRegler.configSet('stufen',     '0');		// Stufenregler: Stufe hinzufügen
		 * meinRegler.configSet('stufen',     '20');		// Stufenregler: Stufe hinzufügen
		 * meinRegler.configSet('stufen',     '50');		// Stufenregler: Stufe hinzufügen
		 * meinRegler.configSet('stufen',     '70');		// Stufenregler: Stufe hinzufügen
		 * meinRegler.configSet('stufen',     '100');		// Stufenregler: Stufe hinzufügen
		 * 
		 * meinRegler.init();					// Regler laden und anzeigen
		 * 
		 * 
		 * Im Javascript - verfügbare Methoden:
		 * ------------------------------------
		 * meinRegler.init();					// Lädt und stellt den Regler mit der aktuelle KOnfiguration dar
		 * meinRegler.set(stellung);				// Den Regler auf eine Stellung setzen
		 * meinRegler.reset();					// Den Regler auf den Startwert zurücksetzen
		 * meinRegler.configSet(name, value);			// Überschreibt die Standard-Konfiguration
		 * meinRegler.configGet(name);				// Liest die aktuelle Konfiguration eines Parameters aus
		 * meinRegler.log();					// Zeigt die Daten des Regler-Objekts in der Konsole (F12) an
		 * 
		 * 
		 */


		// Standard-Konfiguration
		// ======================
		this.config = [];
		this.config['quer']          = 0;
		this.config['mitte']         = 0;			// Mittelstellung
		this.config['start']         = 25;			// Startstellung in %
		this.config['schritte']      = 3;			// Schrittweite in % bei Drehung
		this.config['wert_verlauf']  = 0;			// 0(linear), 1(exponentiell progressiv), -1(exponentiell degressiv)
		this.config['farbe_hinter']  = '#BCBCBC';		// Hintergrundfarbe der Zeichenfläche, '' = keine

		this.config['str_hinter']    = '#606060';		// Hintergrundfarbe des Streifens
		this.config['str_laenge']    = 150;			// Streifenlänge
		this.config['str_breite']    = 4;			// Streifenbreite
		this.config['str_leucht']    = 1;			// 1 = Streifen beleuchtet
		this.config['str_farbe']     = '#00FFFF';		// Farbe des Streifens 'rainbow' = Regenbogenfarben, sonst z.B. '#00FFFF'

		this.config['Knopf_rund']    = 1;			// 1 = rund, 0 = eckig
		this.config['Knopf_radius']  = 10;			// Radius des Knopfes
		this.config['Knopf_laenge']  = 14;			// Knopf Höhe
		this.config['Knopf_breite']  = 24;			// Knopf Breite
		this.config['Knopf_silber']  = 0;			// Farbverlauf silber schattiert (nur bei eckigem Knopf)
		this.config['Knopf_farbe_1'] = '#AAAAAA';		// Farbe unten vom Farbverlauf   (nur bei rundem  Knopf)
		this.config['Knopf_farbe_2'] = '#707070';		// Farbe oben  vom Farbverlauf
		this.config['Knopf_aktiv']   = '#00FF00';		// Farbe wenn Knopf gedrückt

		this.config['skala']         = 1;			// 0 = nein, 1 = ja, 2 = nur 1, 5, 10
		this.config['skala_farbe']   = '#FFFFFF';		// SChriftfarbe der Skala
		this.config['skala_ueber']   = 2;			// Soviel Pixel ragt Skala über den Knopf hinaus
		this.config['skala_breiter'] = 0;			// 1 = Skala dicker werdend

		this.config['stufen']        = [];			// Stufenstellungen in %


		// #############################################################################################################################################################################
		// Hilfsfunktionen


		var thisData;
		var nSrCvDrag     = -1;
		var nSrCvDragX    = 0;
		var nSrCvDragY    = 0;
		var nSrCvRadius   = 0;
		var useSrcvPROZ   = 0;


		this.configSet = function(name, value)
		{
			if( typeof(this.config[name]) !== 'undefined' )
			{
				if( name == 'stufen' )
				{
					this.config[name].push(value);
				} else
				  {
					this.config[name] = value;
				  }
			}
		};


		this.configGet = function(name)
		{
			if( typeof(this.config[name]) !== 'undefined' )
			{
				return this.config[name];
			} else
			  {
				return '?';
			  }
		};


		this.log = function()
		{
			console.log( this );
		};


		this.nGetPosAbs = function(element)
		{
			var top  = 0;
			var left = 0;

			while(element)
			{
				top    += element.offsetTop  || 0;
				left   += element.offsetLeft || 0;
				element = element.offsetParent;
			}

			return {
				top:  top,
				left: left
			};
		};


		this.percentToExSlow = function(percent)
		{
			expValue = ( percent ==   0 ) ? 0 : Math.pow(10,     ( percent * 0.02 ) );
			expValue = Math.round( ( expValue * 100 ) ) / 100;
			return expValue;
		}


		this.percentToExFast = function(percent)
		{
			expValue = ( percent == 100 ) ? 0 : Math.pow(10, 2 - ( percent * 0.02 ) );
			expValue = 100 - expValue;
			expValue = Math.round( ( expValue * 100 ) ) / 100;
			return expValue;
		}


		this.nGetRainbow = function(aPro)
		{
			if( aPro < 20 )
			{
				step = Math.ceil( 255 * ( ( aPro -  4 ) / 16 ) );
				chR  = 255;
				chG  = step;
				chB  = 0;
			}
			if( aPro >= 20 && aPro < 36 )
			{
				step = Math.ceil( 255 * ( ( aPro - 20 ) / 16 ) );
				chR  = 255 - step;
				chG  = 255;
				chB  = 0;
			}
			if( aPro >= 36 && aPro < 52 )
			{
				step = Math.ceil( 255 * ( ( aPro - 36 ) / 16 ) );
				chR  = 0;
				chG  = 255;
				chB  = step;
			}
			if( aPro >= 52 && aPro < 68 )
			{
				step = Math.ceil( 255 * ( ( aPro - 52 ) / 16 ) );
				chR  = 0;
				chG  = 255 - step;
				chB  = 255;
			}
			if( aPro >= 68 && aPro < 84 )
			{
				step = Math.ceil( 255 * ( ( aPro - 68 ) / 16 ) );
				chR  = step;
				chG  = 0;
				chB  = 255;
			}
			if( aPro >= 84 )
			{
				step = Math.ceil( 255 * ( ( aPro - 84 ) / 16 ) );
				chR  = 255;
				chG  = 0;
				chB  = 255 - step;
			}

			chR = ( chR <   0 ) ?   0 : chR;
			chG = ( chG <   0 ) ?   0 : chG;
			chB = ( chB <   0 ) ?   0 : chB;

			chR = ( chR > 255 ) ? 255 : chR;
			chG = ( chG > 255 ) ? 255 : chG;
			chB = ( chB > 255 ) ? 255 : chB;

			return 'rgb('+chR+','+chG+','+chB+')';
		}


		// =============================================================================================================================================================================
		// Eventhandler


		this.reset = function(event)
		{
			thisData.set(thisData.config['start']);
		}


		this.mouseDown = function(event)
		{
			// Klick auf Button oder Regler
			// ============================
			clickButton = 0;
			if( event.offsetX >= thisData.config['Knopf_x'] && event.offsetX <= ( thisData.config['Knopf_x'] + thisData.config['Knopf_b'] ) )
			{
				if( event.offsetY >= thisData.config['Knopf_y'] && event.offsetY <= ( thisData.config['Knopf_y'] + thisData.config['Knopf_l'] ) )
				{
					clickButton = 1;
				}
			}
			if( clickButton == 1 )
			{
				// Regler ziehen
				// =============
				nSrCvDrag  = ID;
				nSrCvDragX = -1;
				nSrCvDragY = -1;
			} else
			  {
				// Angeklickte Stellung ermitteln
				// ==============================
				if( thisData.config['quer'] == 1 )
				{
					clickPx0     = ( thisData.config['width'] - thisData.config['str_laenge'] ) / 2;
					clickPx100   = clickPx0 + thisData.config['str_laenge'];
					clickPx      = event.offsetX - clickPx0;
					clickProz    = clickPx / thisData.config['str_laenge'] * 100;
					clickProz    = ( clickProz < 0   ) ?   0 : clickProz;
					clickProz    = ( clickProz > 100 ) ? 100 : clickProz;
				} else
				  {
					clickPx0     = ( thisData.config['height'] - thisData.config['str_laenge'] ) / 2;
					clickPx100   = clickPx0 + thisData.config['str_laenge'];
					clickPx      = event.offsetY - clickPx0;
					clickProz    = clickPx / thisData.config['str_laenge'] * 100;
					clickProz    = ( clickProz < 0   ) ?   0 : clickProz;
					clickProz    = ( clickProz > 100 ) ? 100 : clickProz;
					clickProz    = 100 - clickProz;
				  }

				// Stufen-Regler
				// =============
				if( thisData.config['stufen'].length > 0 )
				{
					stellungGefunden = 0;
					for( stufe = 0; stufe < thisData.config['stufen'].length; stufe++ )
					{
						if( stufe < ( thisData.config['stufen'].length - 1) )
						{
							// Es folgt noch eine weiter Stufe
							if( clickProz >= parseInt(thisData.config['stufen'][stufe]) && clickProz < parseInt(thisData.config['stufen'][(stufe+1)]) )
							{
								// % zwischen dieser und der nächsten Stufe
								neueProz         = parseInt(thisData.config['stufen'][stufe]);
								stellungGefunden = 1;
							} else
							  {
								if( stellungGefunden = 0 )
								{
									neueProz = parseInt(thisData.config['stufen'][(stufe+1)]);
								}
							  }
						} else
						  {
							// Letzte Stufe
							if( clickProz == parseInt(thisData.config['stufen'][stufe]) )
							{
								neueProz = parseInt(thisData.config['stufen'][stufe]);
							}
						  }
					}
					clickProz = neueProz;
				}

				clickProz = Math.round(clickProz);

				thisData.set(clickProz);
			  }

			if( nSrCvDrag != -1 )
			{
				if( thisData.config['quer'] == 1 )
				{
					document.getElementById(ID).style.cursor = 'w-resize';
					document.body.style.cursor               = 'w-resize';
				} else
				  {
					document.getElementById(ID).style.cursor = 'n-resize';
					document.body.style.cursor               = 'n-resize';
				  }
			}
		}


		this.mouseUp = function(event)
		{
			if( nSrCvDrag != -1 )
			{
				if( ( thisData.config['stufen'].length > 0 ) )
				{
					thisData.stellung = useSrcvPROZ;
				}

				nSrCvDrag = -1;

				thisData.set(useSrcvPROZ);
			}

			document.getElementById(ID).style.cursor = 'grab';
			document.body.style.cursor               = 'default';
		}


		this.mouseMove = function(event)
		{
			x = event.clientX + window.pageXOffset;
			y = event.clientY + window.pageYOffset;

			if( nSrCvDrag != -1 )
			{
				if( thisData.config['quer'] == 1 )
				{
					document.getElementById(ID).style.cursor = 'w-resize';
					document.body.style.cursor               = 'w-resize';
				} else
				  {
					document.getElementById(ID).style.cursor = 'n-resize';
					document.body.style.cursor               = 'n-resize';
				  }

				nSrCvDragX = ( nSrCvDragX == -1 ) ? x : nSrCvDragX;
				nSrCvDragY = ( nSrCvDragY == -1 ) ? y : nSrCvDragY;

				if( thisData.config['quer'] == 1 )
				{
					if( x < nSrCvDragX )
					{
						thisData.stellung -=   thisData.config['schritte'];
						thisData.stellung  = ( thisData.stellung <=   0 ) ?   0 : thisData.stellung;
					} else
					if( x > nSrCvDragX )
					{
						thisData.stellung +=   thisData.config['schritte'];
						thisData.stellung  = ( thisData.stellung >= 100 ) ? 100 : thisData.stellung;
					}
				} else
				  {
					if( y > nSrCvDragY )
					{
						thisData.stellung -=   thisData.config['schritte'];
						thisData.stellung  = ( thisData.stellung <=   0 ) ?   0 : thisData.stellung;
					} else
					if( y < nSrCvDragY )
					{
						thisData.stellung +=   thisData.config['schritte'];
						thisData.stellung  = ( thisData.stellung >= 100 ) ? 100 : thisData.stellung;
					}
				  }

				nSrCvDragX = x;
				nSrCvDragY = y;

				thisData.set(thisData.stellung);
			} else
			  {
				mouseOverButton = 0;
				if( event.offsetX >= thisData.config['Knopf_x'] && event.offsetX <= ( thisData.config['Knopf_x'] + thisData.config['Knopf_b'] ) )
				{
					if( event.offsetY >= thisData.config['Knopf_y'] && event.offsetY <= ( thisData.config['Knopf_y'] + thisData.config['Knopf_l'] ) )
					{
						mouseOverButton = 1;
					}
				}
				document.getElementById(ID).style.cursor = ( mouseOverButton == 1 ) ? 'grab' : 'pointer';
			  }
		}


		// =============================================================================================================================================================================
		// Hauptfunktionen


		this.set = function(srcvPROZ)
		{
			useDr       = ID;
			if( canvas  = document.getElementById(useDr) )
			{
				// Stellung auf 2 Nachkommastellen abrunden
				// ========================================
				srcvPROZ = Math.round( ( srcvPROZ * 100 ) ) / 100;

				// Werte-Verlauf
				// =============
				if( this.config['wert_verlauf'] ==  1 )
				{
					exProz  = this.percentToExSlow(srcvPROZ);
					exTitle = ' (exponentiell progressiv)';
				} else
				if( this.config['wert_verlauf'] == -1 )
				{
					exProz  = this.percentToExFast(srcvPROZ);
					exTitle = ' (exponentiell degressiv)';
				} else
				  {
					exProz  = srcvPROZ;
					exTitle = '';
				  }

				canvas.title = exProz + '%' + exTitle;

				ctx = canvas.getContext('2d');

				this.config['width']  = canvas.width;
				this.config['height'] = canvas.height;

				// Stellung
				// ========
				if( srcvPROZ <   0 ) { srcvPROZ =   0; }
				if( srcvPROZ > 100 ) { srcvPROZ = 100; }
				this.stellung = srcvPROZ;

				// Hintergrund
				// ===========
				ctx.clearRect(0, 0, this.config['width'], this.config['height']);
				if( this.config['farbe_hinter'] != '' )
				{
					ctx.fillStyle   = this.config['farbe_hinter'];
					ctx.fillRect(0, 0, this.config['width'], this.config['height']);
				}

				// Streifen berechnen
				// ==================
				if( this.config['quer'] == 1 )
				{
					streifenLinks   = ( this.config['width']  - this.config['str_laenge'] ) / 2;
					streifenOben    = ( this.config['height'] - this.config['str_breite'] ) / 2;
					streifenLaenge  = this.config['str_breite'];
					streifenBreite  = this.config['str_laenge'];
				} else
				  {
					streifenLinks   = ( this.config['width']  - this.config['str_breite'] ) / 2;
					streifenOben    = ( this.config['height'] - this.config['str_laenge'] ) / 2;
					streifenLaenge  = this.config['str_laenge'];
					streifenBreite  = this.config['str_breite'];
				  }

				// Skala
				// =====
				if( this.config['skala'] > 0 )
				{
					ctx.strokeStyle = this.config['skala_farbe'];

					if( this.config['stufen'].length > 0 )
					{
						// Stufen-Regler
						// =============
						ctx.lineWidth = 3;

						for( stufe = 0; stufe < this.config['stufen'].length; stufe++ )
						{
							ctx.beginPath();

							if( this.config['quer'] == 1 )
							{
								// Quer
								// ====
								stBreite   = ( this.config['skala_breiter'] == 1 ) ? ( this.config['Knopf_breite'] + ( this.config['stufen'][stufe] / 100 * this.config['Knopf_breite'] ) ) : this.config['Knopf_breite'];
								skalaOben  = streifenOben - ( ( stBreite - this.config['str_breite'] ) / 2 );
								skalaUnten = skalaOben + stBreite;
								skalaLinks = ( this.config['Knopf_laenge'] / 2 ) + streifenLinks + ( ( streifenBreite - this.config['Knopf_laenge'] ) * ( this.config['stufen'][stufe] / 100 ) );
								ctx.moveTo(skalaLinks, skalaOben  - this.config['skala_ueber']);
								ctx.lineTo(skalaLinks, skalaUnten + this.config['skala_ueber']);
							} else
							  {
								// Hochkant
								// ========
								stBreite    = ( this.config['skala_breiter'] == 1 ) ? ( this.config['Knopf_breite'] + ( this.config['stufen'][stufe] / 100 * this.config['Knopf_breite'] ) ) : this.config['Knopf_breite'];
								skalaLinks  = streifenLinks - ( ( stBreite - this.config['str_breite'] ) / 2 );
								skalaRechts = skalaLinks + stBreite;
								skalaOben   = ( this.config['Knopf_laenge'] / 2 ) + streifenOben + ( ( streifenLaenge - this.config['Knopf_laenge'] ) * ( ( 100 - this.config['stufen'][stufe] ) / 100 ) );
								ctx.moveTo(skalaLinks  - this.config['skala_ueber'], skalaOben);
								ctx.lineTo(skalaRechts + this.config['skala_ueber'], skalaOben);
							  }
							ctx.stroke();
							ctx.closePath();
						}
					} else
					  {
						// Linear-Regler
						// =============
						for( st = 0; st < 11; st++ )
						{
							if( this.config['skala'] == 2 )
							{
								freigabe = ( st == 0 || st == 5 || st == 10 ) ? 1 : 0;
							} else
							  {
								freigabe = 1;
							  }
							if( freigabe == 1 )
							{
								ctx.lineWidth = ( st == 0 || st == 5 || st == 10 ) ? 3 : 1;
								ctx.beginPath();
								if( this.config['quer'] == 1 )
								{
									// Quer
									// ====
									if( this.config['mitte'] == 1 )
									{
										stBreite = ( this.config['skala_breiter'] == 1 ) ? ( this.config['Knopf_breite'] + ( Math.sqrt(Math.pow((st-5),2)) * 4 ) ) : this.config['Knopf_breite'];
									} else
									  {
										stBreite = ( this.config['skala_breiter'] == 1 ) ? ( this.config['Knopf_breite'] + ( st * 2 ) )                            : this.config['Knopf_breite'];
									  }
									skalaOben  = streifenOben - ( ( stBreite - this.config['str_breite'] ) / 2 );
									skalaUnten = skalaOben + stBreite;
									skalaLinks = ( this.config['Knopf_laenge'] / 2 ) + streifenLinks + ( st * ( ( streifenBreite - this.config['Knopf_laenge'] ) / 10 ) );
									ctx.moveTo(skalaLinks, skalaOben  - this.config['skala_ueber']);
									ctx.lineTo(skalaLinks, skalaUnten + this.config['skala_ueber']);
								} else
								  {
									// Hochkant
									// ========
									if( this.config['mitte'] == 1 )
									{
										stBreite = ( this.config['skala_breiter'] == 1 ) ? ( this.config['Knopf_breite'] + ( Math.sqrt(Math.pow(((10-st)-5),2)) * 4 ) ) : this.config['Knopf_breite'];
									} else
									  {
										stBreite = ( this.config['skala_breiter'] == 1 ) ? ( this.config['Knopf_breite'] + ( ( 10 - st ) * 2 ) )                        : this.config['Knopf_breite'];
									  }
									skalaLinks  = streifenLinks - ( ( stBreite - this.config['str_breite'] ) / 2 );
									skalaRechts = skalaLinks + stBreite;
									skalaOben   = ( this.config['Knopf_laenge'] / 2 ) + streifenOben + ( st * ( ( streifenLaenge - this.config['Knopf_laenge'] ) / 10 ) );
									ctx.moveTo(skalaLinks  - this.config['skala_ueber'], skalaOben);
									ctx.lineTo(skalaRechts + this.config['skala_ueber'], skalaOben);
								  }
								ctx.stroke();
								ctx.closePath();
							}
						}
					  }
				}

				// Streifen zeichnen
				// =================
				ctx.beginPath();
				ctx.lineWidth   = 1;
				ctx.strokeStyle = '#000000';
				ctx.fillStyle   = this.config['str_hinter'];
				ctx.rect(streifenLinks, streifenOben, streifenBreite, streifenLaenge);
				ctx.stroke();
				ctx.fill();
				ctx.closePath();

				// Stellung bei Stufenreglern
				// ==========================
				if( this.config['stufen'].length > 0 )
				{
					// Stufen-Regler
					// =============
					stellungGefunden = 0;
					for( stufe = 0; stufe < this.config['stufen'].length; stufe++ )
					{
						if( stufe < ( this.config['stufen'].length - 1) )
						{
							// Es folgt noch eine weiter Stufe
							if( srcvPROZ >= parseInt(this.config['stufen'][stufe]) && srcvPROZ < parseInt(this.config['stufen'][(stufe+1)]) )
							{
								// % zwischen dieser und der nächsten Stufe
								useSrcvPROZ      = parseInt(this.config['stufen'][stufe]);
								stellungGefunden = 1;
							} else
							  {
								if( stellungGefunden = 0 )
								{
									useSrcvPROZ = parseInt(this.config['stufen'][(stufe+1)]);
								}
							  }
						} else
						  {
							// Letzte Stufe
							if( srcvPROZ == parseInt(this.config['stufen'][stufe]) )
							{
								useSrcvPROZ = parseInt(this.config['stufen'][stufe]);
							}
						  }
					}
				} else
				  {
					// Linear-Regler
					// =============
					useSrcvPROZ = srcvPROZ;
				  }

				// Knopf berechnen
				// ===============
				if( this.config['Knopf_rund'] == 1 )
				{
					// Rund
					// ====
					if( this.config['quer'] == 1 )
					{
						// Quer
						// ====
						streifenRange = ( ( this.config['str_laenge'] - this.config['Knopf_laenge'] ) * ( useSrcvPROZ / 100 ) );
						knopfLinks    = streifenLinks + streifenRange;
						knopfOben     = streifenOben - ( ( this.config['Knopf_breite'] - this.config['str_breite'] ) / 2 );
						knopfBreite   = this.config['Knopf_laenge'];
						knopfLaenge   = this.config['Knopf_breite'];
					} else
					  {
						// Hochkant
						// ========
						streifenRange = ( ( this.config['str_laenge'] - this.config['Knopf_laenge'] ) * ( ( 100 - useSrcvPROZ ) / 100 ) );
						knopfLinks    = streifenLinks - ( ( this.config['Knopf_breite'] - this.config['str_breite'] ) / 2 );
						knopfOben     = streifenOben + streifenRange;
						knopfBreite   = this.config['Knopf_breite'];
						knopfLaenge   = this.config['Knopf_laenge'];
					  }
				} else
				  {
					// Eckig
					// =====
					if( this.config['quer'] == 1 )
					{
						// Quer
						// ====
						streifenRange = ( ( this.config['str_laenge'] - this.config['Knopf_laenge'] ) * ( useSrcvPROZ / 100 ) );
						knopfLinks    = streifenLinks + streifenRange;
						knopfOben     = streifenOben - ( ( this.config['Knopf_breite'] - this.config['str_breite'] ) / 2 );
						knopfBreite   = this.config['Knopf_laenge'];
						knopfLaenge   = this.config['Knopf_breite'];
					} else
					  {
						// Hochkant
						// ========
						streifenRange = ( ( this.config['str_laenge'] - this.config['Knopf_laenge'] ) * ( ( 100 - useSrcvPROZ ) / 100 ) );
						knopfLinks    = streifenLinks - ( ( this.config['Knopf_breite'] - this.config['str_breite'] ) / 2 );
						knopfOben     = streifenOben + streifenRange;
						knopfBreite   = this.config['Knopf_breite'];
						knopfLaenge   = this.config['Knopf_laenge'];
					  }
				  }
				this.config['Knopf_x'] = knopfLinks;
				this.config['Knopf_y'] = knopfOben;
				this.config['Knopf_b'] = knopfBreite;
				this.config['Knopf_l'] = knopfLaenge;

				// Streifen-Beleuchtung
				// ====================
				if( this.config['str_leucht'] == 1 )
				{
					if( this.config['mitte'] == 1 )
					{
						// Für Mittelstellung
						// ==================
						if( this.config['quer'] == 1 )
						{
							// Quer
							// ====
							leuchtOben   = streifenOben;
							leuchtLaenge = this.config['str_breite'];
							if( useSrcvPROZ > 50 )
							{
								leuchtLinks  = this.config['width'] / 2;
								leuchtBreite = ( knopfLinks + this.config['Knopf_laenge'] ) - ( this.config['width'] / 2 ) - 1;
							} else
							if( useSrcvPROZ < 50 )
							{
								leuchtLinks  = knopfLinks + 1;
								leuchtBreite = ( 0.5 * this.config['str_laenge'] ) - streifenRange;
							} else
							  {
								leuchtLinks  = knopfLinks + 1;
								leuchtBreite = 0;
							  }
						} else
						  {
							// Hochkant
							// ========
							leuchtLinks  = streifenLinks;
							leuchtBreite = this.config['str_breite'];
							if( useSrcvPROZ > 50 )
							{
								leuchtOben   = knopfOben + 1;
								leuchtLaenge = ( this.config['str_laenge'] - streifenRange ) - ( 0.5 * this.config['str_laenge'] );
							} else
							if( useSrcvPROZ < 50 )
							{
								leuchtOben   = streifenOben + ( 0.5 * this.config['str_laenge'] );
								leuchtLaenge = -1 * ( ( ( this.config['str_laenge'] - this.config['Knopf_laenge'] ) - streifenRange ) - ( 0.5 * this.config['str_laenge'] ) ) - 1;
							} else
							  {
								leuchtOben   = streifenOben + ( 0.5 * this.config['str_laenge'] );
								leuchtLaenge = 0;
							  }
						  }
					} else
					  {
						// Für Normalstellung
						// ==================
						if( this.config['quer'] == 1 )
						{
							// Quer
							// ====
							leuchtLinks  = streifenLinks;
							leuchtOben   = streifenOben;
							leuchtBreite = this.config['str_laenge'] - ( this.config['str_laenge'] - streifenRange );
							leuchtLaenge = this.config['str_breite'];
						} else
						  {
							// Hochkant
							// ========
							leuchtLinks  = streifenLinks;
							leuchtOben   = knopfOben + this.config['Knopf_laenge'];
							leuchtBreite = this.config['str_breite'];
							leuchtLaenge = ( this.config['str_laenge'] - this.config['Knopf_laenge'] ) - streifenRange;
						  }
					  }

					// Regenbogenfarben
					// ================
					if( this.config['str_farbe'] == 'rainbow' )
					{
						if( this.config['quer'] == 1 )
						{
							nDrGradient = ctx.createLinearGradient(streifenLinks, streifenOben,                             streifenLinks + this.config['str_laenge'], streifenOben);
						} else
						  {
							nDrGradient = ctx.createLinearGradient(streifenLinks, streifenOben + this.config['str_laenge'], streifenLinks,                             streifenOben);
						  }
						for( rv = 0; rv <= 25; rv++ )
						{
							nDrGradient.addColorStop(rv*4/100, this.nGetRainbow(rv*4));
						}
						ctx.fillStyle = nDrGradient;
					} else
					  {
						ctx.fillStyle = this.config['str_farbe'];
					  }
					ctx.fillRect(leuchtLinks, leuchtOben, leuchtBreite, leuchtLaenge);
				}

				// Knopf erst über Leuchtstreifen zeichnen
				// =======================================
				if( this.config['Knopf_rund'] == 1 )
				{
					if( this.config['quer'] == 1 )
					{
						nDrGradient = ctx.createLinearGradient(knopfLinks, knopfOben, knopfLinks, knopfOben+this.config['Knopf_breite']);
					} else
					  {
						nDrGradient = ctx.createLinearGradient(knopfLinks, knopfOben, knopfLinks, knopfOben+this.config['Knopf_laenge']);
					  }

					nDrGradient.addColorStop(0, this.config['Knopf_farbe_1']);
					nDrGradient.addColorStop(1, this.config['Knopf_farbe_2']);
					ctx.fillStyle   = nDrGradient;

					ctx.beginPath();
					ctx.lineWidth   = 1;
					ctx.strokeStyle = 'transparent';
					ctx.arc(knopfLinks+(knopfBreite/2), knopfOben+(knopfLaenge/2), this.config['Knopf_radius'], 0, 2*Math.PI, false);
					ctx.stroke();
					ctx.fill();
					ctx.closePath();

					// Punkt
					ctx.beginPath();
					ctx.lineWidth   = 1;
					ctx.fillStyle   = ( nSrCvDrag != -1 ) ? this.config['Knopf_aktiv'] : this.config['skala_farbe'];
					ctx.strokeStyle = ( nSrCvDrag != -1 ) ? this.config['Knopf_aktiv'] : this.config['skala_farbe'];
					ctx.arc(knopfLinks+(knopfBreite/2), knopfOben+(knopfLaenge/2), 3, 0, 2*Math.PI, false);
					ctx.stroke();
					ctx.fill();
					ctx.closePath();
				} else
				  {
					if( this.config['Knopf_silber'] == 1 )
					{
						ctx.lineWidth   = 2;
						ctx.strokeStyle = ( nSrCvDrag != -1 ) ? this.config['Knopf_aktiv'] : '#606060';

						if( this.config['quer'] == 1 )
						{
							nDrGradient = ctx.createLinearGradient(knopfLinks,knopfOben, knopfLinks+knopfBreite, knopfOben);
							nDrGradient.addColorStop(0, '#666666');
							nDrGradient.addColorStop(1, '#DDDDDD');
							ctx.fillStyle   = nDrGradient;
							ctx.fillRect(knopfLinks,knopfOben, knopfBreite, knopfLaenge);

							// Strich
							ctx.beginPath();
							ctx.moveTo(knopfLinks+(this.config['Knopf_laenge']/2), knopfOben+2);
							ctx.lineTo(knopfLinks+(this.config['Knopf_laenge']/2), knopfOben+this.config['Knopf_breite']-2);
						} else
						  {
							nDrGradient = ctx.createLinearGradient(knopfLinks,knopfOben, knopfLinks, knopfOben+knopfLaenge);
							nDrGradient.addColorStop(0, '#666666');
							nDrGradient.addColorStop(1, '#DDDDDD');
							ctx.fillStyle   = nDrGradient;
							ctx.fillRect(knopfLinks,knopfOben, knopfBreite, knopfLaenge);

							// Strich
							ctx.beginPath();
							ctx.moveTo(knopfLinks+2,                               knopfOben+(this.config['Knopf_laenge']/2));
							ctx.lineTo(knopfLinks+this.config['Knopf_breite']-2,   knopfOben+(this.config['Knopf_laenge']/2));
						  }
						ctx.stroke();
						ctx.closePath();
					} else
					  {
						ctx.fillStyle   = this.config['Knopf_farbe_2'];
						ctx.fillRect(knopfLinks,knopfOben, knopfBreite, knopfLaenge);

						// Strich
						ctx.beginPath();
						ctx.lineWidth   = 2;
						ctx.strokeStyle = ( nSrCvDrag != -1 ) ? this.config['Knopf_aktiv'] : this.config['skala_farbe'];
						if( this.config['quer'] == 1 )
						{
							ctx.moveTo(knopfLinks+(this.config['Knopf_laenge']/2), knopfOben+2);
							ctx.lineTo(knopfLinks+(this.config['Knopf_laenge']/2), knopfOben+this.config['Knopf_breite']-2);
						} else
						  {
							ctx.moveTo(knopfLinks+2,                               knopfOben+(this.config['Knopf_laenge']/2));
							ctx.lineTo(knopfLinks+this.config['Knopf_breite']-2,   knopfOben+(this.config['Knopf_laenge']/2));
						  }
						ctx.stroke();
						ctx.closePath();
					  }
				  }

				this.prozente = exProz;

				// Wert in externer Funktion weiter verarbeiten
				// ============================================
				if( typeof(Schieberegler_Function) === 'function' )
				{
					// Ggf. Stellung aus nicht-linearer Skala ausgeben
					// ===============================================
					thisData = this;
					Schieberegler_Function(thisData);
				}
			}
		}


		this.init = function()
		{
			if( canvas = document.getElementById(ID) )
			{
				// Initialisieren
				// ==============

				// Ggf. fehlerhafte Konfiguration überschreiben
				// ============================================
				if( this.config['stufen'].length > 0 && this.config['mitte'] == 1 )
				{
					this.config['mitte'] = 0;
				}

				this.config['Knopf_x'] = 0;
				this.config['Knopf_y'] = 0;
				this.config['Knopf_b'] = 0;
				this.config['Knopf_l'] = 0;

				this.ID                = ID;
				thisData               = this;

				document.getElementById(ID).addEventListener("dblclick",  this.reset,     true);
				document.getElementById(ID).addEventListener("mousedown", this.mouseDown, true);

				document.addEventListener(                   "mouseup",   this.mouseUp,   true);
				document.addEventListener(                   "mousemove", this.mouseMove, true);

				this.set(this.config['start']);
			}
		}
	}

