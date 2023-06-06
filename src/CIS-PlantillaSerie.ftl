<#--
Widget templates can be used to modify the look of a
specific application.

Please use the right panel to quickly add commonly used variables.
Autocomplete is also available and can be invoked by typing "${".
-->
	
   <#assign liferay_ui = PortletJspTagLibs["/META-INF/liferay-ui.tld"] />
   <#assign liferay_util = PortletJspTagLibs["/META-INF/liferay-util.tld"] />
   <#assign aui = PortletJspTagLibs["/META-INF/liferay-aui.tld"] />
   <#assign numSerie = "${paramUtil.get(themeDisplay.getRequest(),'numSerie','0')}"/> 
   <#assign tipo = "SERIE"/> 

   <div class="container-detalle-estudio">
        <h3>Serie</h3>        
        <div class="mb-3">
            <span id="<@portlet.namespace />BarraSerie"></span>
        </div>
        <#-- Funcionalidad datos principales de estudio  -->
        <div class="accordion acordeon ul-pc ol-pc accordion-primary" id="<@portlet.namespace />datosPrincipales">
            <div class="card">
                <div class="card-header" id="heading<@portlet.namespace />datosPrincipales">	
                    <h4 class="mb-0">
                        <a aria-controls="<@portlet.namespace />datosPrincipales" aria-expanded="false" data-toggle="collapse" href="#coll<@portlet.namespace />datosPrincipales" role="button">
                            <span id="<@portlet.namespace />tituloSerie"></span>
                        </a>
                    </h4>		   
                </div>
                <div id="coll<@portlet.namespace />graficaSerie" class="collapse show" aria-labelledby="heading<@portlet.namespace />graficaSerie" data-parent="#<@portlet.namespace />graficaSerie" role="region">
                    <div class="card-body">
                        <div class="row pc-listas content">
                            <div class="col-md-9">
                                <!-- PORTLET DE GRAFICAS DE SERIES -->
                            </div>
                                
                        </div>
                    </div>
                </div> 
               
            </div>		
        </div>
       >
        
    </div>
    <script>
        var numSerie = ${codEstudio};
        var tipo = ${tipo};


        
        /*
         CARGA INICIAL DE DATOS
        */
		$(document).ready(function(){
            //
            //
            //

        }); //end document.ready
			
		
			

  
	</script>