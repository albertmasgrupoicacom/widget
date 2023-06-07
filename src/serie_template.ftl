<#assign numSerie = "${paramUtil.get(themeDisplay.getRequest(),'numSerie','0')}"/> 
   <#assign tipo = "SERIE"/>
	 <#assign myNavPrefs = freeMarkerPortletPreferences.getPreferences({"type": "SERIE","id_cuestionario": 3400}) />

	 <script>
        var tipo = 'SERIE';
		    var numSerie = ${numSerie};
        /*
         CARGA INICIAL DE DATOS
        */
   </script>
	<button id="buttonPass">PASS</button>
   <div class="container-detalle-estudio">
        <h3>Serie</h3>        
                    <div class="card-body">
                        <div class="row pc-listas content">
                            <div class="col-md-9">
                                <!-- PORTLET DE GRAFICAS DE SERIES -->
																<@liferay_portlet["runtime"]
		                              queryString="&instanceId=AAA"
                                  defaultPreferences="${myNavPrefs}"
                                  portletName="chart1_INSTANCE_ybmn"
                                />
                            </div>    
                        </div>
                    </div>
     </div>

<!-- SERVER  -->

     <#assign numSerie = "${paramUtil.get(themeDisplay.getRequest(),'numSerie','0')}"/> 
   <#assign tipo = "SERIE"/>
	 <#assign myNavPrefs = freeMarkerPortletPreferences.getPreferences({"type": "SERIE","id_cuestionario": 3400}) />

	 <script>
        var tipo = 'SERIE';
		    var numSerie = ${numSerie};
        /*
         CARGA INICIAL DE DATOS
        */
   </script>
   <div class="container-detalle-estudio">       
                    <div class="card-body">
                        <div class="row pc-listas content">
                            <div class="col-md-9">
                                <!-- PORTLET DE GRAFICAS DE SERIES -->
																<@liferay_portlet["runtime"]
		                              queryString="&instanceId=AAA"
                                  defaultPreferences="${myNavPrefs}"
                                  portletName="chart1_INSTANCE_ybmn"
                                />
                            </div>    
                        </div>
                    </div>
     </div>