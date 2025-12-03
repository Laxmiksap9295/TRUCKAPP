var oThat;
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "com/olam/zgtmmtruckalloc/util/Formatter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/export/Spreadsheet",
    "sap/m/BusyDialog",
    "sap/m/BusyIndicator",
    "sap/ui/table/TablePersoController"
], (Controller, JSONModel, Filter, FilterOperator, Fragment, Formatter, MessageBox, MessageToast, Spreadsheet, BusyDialog, BusyIndicator, TablePersoController) => {
    "use strict";


    return Controller.extend("com.olam.zgtmmtruckalloc.controller.View1", {
        Formatter: Formatter,
        onInit() {
            // NWABAP TEST
            oThat = this;
            oThat.BusyDialog = new BusyDialog()
            this.oClonedTransporterData = [];
            this.ApprovalPageSelectedItem = [];
            var oMonthModel = new JSONModel();
            this._oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this._oReportsTable = this.byId("idReportsTable");
            this._oTablePersoController = new TablePersoController({
                table: this._oReportsTable
            });
            // Current Month Model
            var oModel = new sap.ui.model.json.JSONModel();
            var oToday = new Date();
            oToday.setMonth(oToday.getMonth() + 1, 0);
            oModel.setData({
                maxDate: oToday
            });
            this.getView().setModel(oModel, "currentMonthModel");

            // Attach load complete handler before setting the model
            oMonthModel.attachRequestCompleted(function () {

                console.log("first" + oMonthModel);
                var curMonth = new Date().getMonth() + 1;
                var iPrev = curMonth - 1;
                var iNext = curMonth + 1;
                for (var x in oMonthModel.oData.months) {
                    if (curMonth === parseInt(oMonthModel.oData.months[x].key)) {
                        oMonthModel.oData.months[x].menable = true;
                    }
                    if (iNext === parseInt(oMonthModel.oData.months[x].key)) {
                        oMonthModel.oData.months[x].menable = true;
                    }
                    // checking if curret date is less than or equal to 5th of month than hide the past month
                     if (new Date().getDate() <= 5) {
                            if (iPrev === parseInt(oMonthModel.oData.months[x].key)) {
                                oMonthModel.oData.months[x].menable = true;
                            }
                        } else {
                            if (iPrev === parseInt(oMonthModel.oData.months[x].key)) {
                                oMonthModel.oData.months[x].menable = false;
                            }
                        }
                    // if (iPrev === parseInt(oMonthModel.oData.months[x].key)) {
                    //     oMonthModel.oData.months[x].menable = true;
                    // }

                }
                this.getView().setModel(oMonthModel, "oMonthsModel"); // set after load completes

            }.bind(this));
            var sPath = jQuery.sap.getModulePath("com.olam.zgtmmtruckalloc", "/model/months.json");
            oMonthModel.loadData(sPath);

            var currentMonthIndex = new Date().getMonth();
            this.byId("id_MonthCombo").setSelectedKey(currentMonthIndex.toString());


            // set current year as default in Date Filter
            var oDatePicker = this.byId("idYearPicker");
            var oToday = new Date();
            // Set month and date to avoid affecting the year-only display
            // oToday.setMonth(0);
            // oToday.setDate(1);
            oDatePicker.setDateValue(oToday); // sets current year

            // var oTablemodel = new sap.ui.model.json.JSONModel();
            // oTablemodel.loadData("model/transport.json");
            // this.getView().setModel(oTablemodel);

            var oTableModel = new JSONModel();
            // oTableModel.setSizeLimit(aResults.length);
            // oTableModel.setData(aResults);
            this.getView().setModel(oTableModel, "TableModel");

            var oVisible = {
                "table": true,
                "treetable": false,
                "FormDisp": false,
                "FilterItem": true
            };
            this.getView().setModel(new JSONModel(oVisible), "VISI");
            this.getView().getModel('VISI').refresh(true);


            // var oModel = this.getOwnerComponent().getModel("TransportModel").setData([]);
            oThat.oSegmentBtn = this.byId("idSegmentedButton");

            this._AccessSetcall();
            this.getView().setModel(new sap.ui.model.json.JSONModel([]), "TableModel");
            // this.byId("id_MonthlyFilter").setVisible(false);


            // this.getOwnerComponent().getRouter().getRoute("RouteView1").attachPatternMatched(this._onObjectMatched, this);

            //  const oAppLifeCycle = sap.ushell.Container.getService("AppLifeCycle");

            //       oAppLifeCycle.attachAppStateChanged(function (oEvent) {
            //         const sNavigationMode = oEvent.getParameter("navigationMode");

            //         if (sNavigationMode === "back") {
            //           // Show confirmation dialog
            //           sap.m.MessageBox.confirm("Are you sure you want to exit?", {
            //             onClose: function (oAction) {
            //               if (oAction === sap.m.MessageBox.Action.OK) {
            //                 // Allow navigation
            //                 history.back();
            //               } else {
            //                 // Prevent navigation
            //                 // You may need to handle this manually depending on your app structure
            //               }
            //             }
            //           });
            //         }
            //       });

            // var oRouter = this.getOwnerComponent().getRouter();

            // oRouter.attachRouteMatchedPattern(this._onRouteMatched, this);



        },
        // _onRouteMatched: function () {
        //      if (!this._isProcessCompleted) {
        //             // oEvent.preventDefault(); // Stop navigation
        //             sap.m.MessageBox.confirm("You have unsaved changes. Do you want to leave without saving?", {
        //                 onClose: function (oAction) {
        //                     if (oAction === sap.m.MessageBox.Action.YES) {
        //                         this._isProcessCompleted = true;
        //                         oRouter.navTo(oEvent.getParameter("name")); // Proceed manually
        //                     }
        //                 }.bind(this)
        //             });
        //         }
        // },

        onPersoButtonPressed: function () {
            this._oTablePersoController.openDialog();
        },
        // Odata call to get Access for Approval and Rejection
        _AccessSetcall: function () {
            // BusyIndicator.show();
            oThat.BusyDialog.open();
            this.getOwnerComponent().getModel().read("/AccessSet", {
                // filters: filters,
                success: function (oData, oResponse) {
                    oThat.ApproveBtn = oThat.getView().byId("id_ApproveBtn");
                    oThat.RejectBtn = oThat.getView().byId("id_RejectBtn");
                    oThat.BusyDialog.close();
                    //  var aResults = oData.results[0];

                    var access = oData.results[0];

                    // Store access in controller for later use
                    oThat._access = access;

                    // Show/hide segmented buttons
                    oThat.byId("idSegBtnC").setVisible(access.CreateScreen === "X");
                    oThat.byId("idSegBtnM").setVisible(access.ChangeScreen === "X");
                    oThat.byId("idSegBtnD").setVisible(access.DisplayScreen === "X");
                    oThat.byId("idSegBtnA").setVisible(access.ApproveScreen === "X");
                    var defaultKey = "";
                    if (access.CreateScreen === "X") defaultKey = "CREATE";
                    else if (access.ChangeScreen === "X") defaultKey = "CHANGE";
                    else if (access.DisplayScreen === "X") defaultKey = "DISPLAY";
                    else if (access.ApproveScreen === "X") defaultKey = "Approval";
                    if (defaultKey == "CREATE" || defaultKey == "CHANGE" || defaultKey == "DISPLAY" || defaultKey == "Approval") {
                        oThat.oSegmentBtn.setSelectedKey(defaultKey);
                        oThat.onselectSegBtn({
                            getSource: () => ({
                                mProperties: {
                                    key: defaultKey
                                }
                            })
                        });
                    } else {
                        //error dialog without close buttons
                        if (oThat._oErrorDialog) {
                            oThat._oErrorDialog.destroy();
                        }
                        oThat._oErrorDialog = new sap.m.Dialog({
                            title: "Error",
                            type: "Message",
                            contentWidth: "25rem",
                            content: new sap.m.HBox({
                                alignItems: "Center",
                                items: [
                                    new sap.ui.core.Icon({
                                        src: "sap-icon://message-error",
                                        color: "Negative",
                                        size: "2rem",
                                        layoutData: new sap.m.FlexItemData({
                                            styleClass: "sapUiSmallMarginEnd"
                                        })
                                    }),
                                    new sap.m.Text({
                                        text: "You do not have access to Create, Change, or Display screens. Please contact SAP support"
                                    })
                                ]
                            }),
                            buttons: [], // No buttons at all
                            escapeHandler: function () {
                                // Prevent closing with ESC
                            },
                            afterOpen: function () {
                                //   oThat.byId("idSegmentedButton").setEnabled(false);
                            }
                        });
                        //   oThat._oErrorDialog.setEscapeHandler(function () {});
                        oThat._oErrorDialog.open();
                    }

                },
                error: function (oError) {
                    // BusyIndicator.hide();
                    oThat.BusyDialog.close();
                    MessageBox.error(oError.responseText);
                }
            });
        },
        //******************************************* */ Start of Segemet Buttons*********************
        onselectSegBtn: function (oEvent) {
            var access = oThat._access || {};

            var oSelected = oEvent.getSource().mProperties.key;
            this.oMonthsValidation(oSelected);
            if (oSelected == "CREATE") {
                this.oSegmentBtn.setSelectedKey("CREATE");
                this.onClearFilters();
                this.byId('id_PageTitle').setText("Create");
                this.byId('id_MonthQunaty1').setVisible(true);
                this.byId('id_month').setVisible(true);
                this.byId("id_FilterYear").setVisible(true);
                this.byId("id_FilterPlant").setVisible(true);
                // this.byId("id_FilterMaterial").setVisible(true);
                this.byId('id_SubmitBtn').setVisible(false);
                this.byId('id_CancelBtn').setVisible(false);
                this.byId('id_ApproveBtn').setVisible(false);
                this.byId('id_RejectBtn').setVisible(false);
                // this.byId("navigationList").setVisible(false);
                this.byId("id_FilterMonth").setVisible(true);
                this.byId("id_FilterUOM").setVisible(true);
                this.byId("id_MonthlyFilter").setVisible(false);
                this.byId("idDynamicPage1").setVisible(true);
                this.byId("idDynamicPage2").setVisible(false);
                this.byId("idDynamicPage3").setVisible(false);
                this.byId("id_Plant").setValue('');
                // this.byId("id_Material").setValue('');
                // this.byId("inp_uom").setValue('');
                this.byId("id_monthFilter").setValue('');
                this.byId("id_SlectedKey").setKey();
                this.getView().getModel('VISI').getData().table = true;
                this.getView().getModel('VISI').getData().FilterItem = true;
                this.getView().getModel('VISI').getData().treetable = false;
                this.getView().getModel('VISI').getData().FormDisp = false;
                this.getView().getModel('VISI').refresh(true);
                this.getView().getModel("TableModel").setProperty("/", []);

            } else if (oSelected == "CHANGE") {
                this.oSegmentBtn.setSelectedKey("CHANGE");
                this.onClearFilters();
                this.byId('id_PageTitle').setText("Change");
                this.byId('id_MonthQunaty1').setVisible(true);
                this.byId('id_month').setVisible(true);
                this.byId('id_CancelBtn').setVisible(false);
                this.byId("id_MonthlyFilter").setVisible(false);
                this.byId("id_FilterYear").setVisible(false);
                this.byId("id_FilterUOM").setVisible(false);
                this.byId("id_FilterYear").setVisible(true);
                this.byId("id_FilterPlant").setVisible(true);
                // this.byId("id_FilterMaterial").setVisible(true);
                this.byId('id_SubmitBtn').setVisible(false);
                this.byId('id_ApproveBtn').setVisible(false);
                this.byId('id_RejectBtn').setVisible(false);
                this.byId("id_FilterMonth").setVisible(true);
                // this.byId("id_FilterUOM").setVisible(true);
                this.byId("idDynamicPage1").setVisible(true);
                this.byId("idDynamicPage2").setVisible(false);
                this.byId("idDynamicPage3").setVisible(false);
                this.byId("id_Plant").setValue('');
                // this.byId("id_Material").setValue('');
                // this.byId("inp_uom").setValue('');
                this.byId("id_monthFilter").setValue('');
                this.byId("id_SlectedKey").setKey();
                this.getView().getModel('TableModel').setData();
                this.getView().getModel('TableModel').refresh();
                this.getView().getModel('VISI').getData().table = true;
                this.getView().getModel('VISI').getData().FilterItem = true;
                this.getView().getModel('VISI').getData().treetable = false;
                this.getView().getModel('VISI').getData().FormDisp = false;
                this.getView().getModel('VISI').refresh(true);
                this.getView().getModel("TableModel").setProperty("/", [])



            }
            else if (oSelected === "DISPLAY") {
                this.oSegmentBtn.setSelectedKey("DISPLAY");
                this.onClearFilters();
                // var approveAccess = (access.ApproveScreen === "X");
                this.byId('id_MonthQunaty1').setVisible(false);
                this.byId('id_month').setVisible(false);
                this.byId('id_SubmitBtn').setVisible(false);
                this.byId("idDynamicPage1").setVisible(true);
                this.byId("idDynamicPage2").setVisible(false);
                this.byId("idDynamicPage3").setVisible(false);
                // this.byId('id_ApproveBtn').setVisible(true);
                // this.byId('id_RejectBtn').setVisible(true);
                // if (oThat.hadAccess) {
                //     this.byId('id_PageTitle').setText("Approve");
                //     oThat.ApproveBtn.setVisible(true);
                //     oThat.RejectBtn.setVisible(true);
                // } else {
                //     this.byId('id_PageTitle').setText("Display");
                //     oThat.ApproveBtn.setVisible(false);
                //     oThat.RejectBtn.setVisible(false);
                // }
                //this.byId("navigationList").setVisible(true);
                this.byId('id_ApproveBtn').setVisible(false);
                this.byId('id_RejectBtn').setVisible(false);
                this.byId('id_PageTitle').setText(this._oBundle.getText("Display"));
                this.getView().getModel('VISI').getData().table = false;
                this.getView().getModel('VISI').getData().FilterItem = false;
                this.getView().getModel('VISI').getData().treetable = true;
                this.getView().getModel('VISI').getData().FormDisp = true;
                this.getView().getModel('VISI').refresh(true);
            } else if (oSelected === "Approval") {
                this.oSegmentBtn.setSelectedKey("Approval");
                this.onClearFilters();
                this.byId('id_PageTitle').setText(this._oBundle.getText("Approvals"));
                this.byId("idDynamicPage1").setVisible(false);
                this.byId("idDynamicPage2").setVisible(true);
                this.byId("idDynamicPage3").setVisible(false);
                this.byId("id_ApproveBtn").setVisible(false);
                this.byId("id_SubmitBtn").setVisible(false);
                this.byId("id_RejectBtn").setVisible(false);
                this.byId("id_CancelBtn").setVisible(false);
                this.getAppovalRecords();
            } else if (oSelected === "REPORTS") {
                this.oSegmentBtn.setSelectedKey("REPORTS");
                this.onClearFilters();
                this.byId('id_PageTitle').setText(this._oBundle.getText("Reports"));
                this.byId("idDynamicPage1").setVisible(false);
                this.byId("idDynamicPage2").setVisible(false);
                this.byId("idDynamicPage3").setVisible(true);
                this.byId("id_ApproveBtn").setVisible(false);
                this.byId("id_SubmitBtn").setVisible(false);
                this.byId("id_RejectBtn").setVisible(false);
                this.byId("id_CancelBtn").setVisible(false);
            }

        },
        //******************************************* */ End of Segemet Buttons************************











        // not sure where it used check and con=mment out

        onTransportData: function () {
            var oDataModel = this.getOwnerComponent().getModel();
            oDataModel.read("/TransportDataSet", {
                success: function (oData, oResponse,) {
                    oThat.plant.open();
                    var aResults = oData.results;
                    var oPlant = new JSONModel();
                    oPlant.setSizeLimit(aResults.length);
                    oPlant.setData(aResults);
                    oThat.getView().setModel(oPlant, "PlantModel");

                },
                error: function (oError) {
                    MessageBox.error(oError.responseText);

                },
            });


        },
        // **********************************************************F4 Value Help***********************
        // F4 Plant
        oPlantValueHelp: function (oEvent) {
            var oThat = this;
            oThat.BusyDialog.open();
            var oInput = oEvent.getSource();
            oThat._sInputId = oInput.getId().split("--").pop();
            if (!oThat.plant) {
                oThat.plant = sap.ui.xmlfragment("com.olam.zgtmmtruckalloc.fragments.Plant", oThat);
                oThat.oView.addDependent(oThat.plant);
            }
            oThat.plant.setMultiSelect(oThat._sInputId.includes('Report'));
            var oDataModel = this.getOwnerComponent().getModel();
            oDataModel.read("/PlantF4Set", {
                success: function (oData, oResponse,) {
                    oThat.plant.open();
                    var aResults = oData.results;
                    var oPlant = new JSONModel();
                    oPlant.setSizeLimit(aResults.length);
                    oPlant.setData(aResults);
                    oThat.getView().setModel(oPlant, "PlantModel");
                    oThat.BusyDialog.close();
                },
                error: function (error) {

                },
            });
        },

        fnPlantClose: function (oEvent) {
            var isReportPlantF4 = oThat._sInputId.includes('Report');
            if (isReportPlantF4) {
                oThat.reportPlantList = [];
                var oSelectedItems = oEvent.getParameter("selectedItems");
                if (oSelectedItems) {
                    var oMultiInput = this.byId("id_ReportPlant");
                    oMultiInput.removeAllTokens();
                    oSelectedItems.forEach(function (oItem) {
                        // var sKey = oItem.getTitle();
                        var sText = oItem.getTitle();
                        var oToken = new sap.m.Token({
                            // key: sKey,
                            text: sText
                        });
                        oMultiInput.addToken(oToken);
                        oThat.reportPlantList.push(sText);
                    });
                    // const sPlant = oSelectedItem.getBindingContext("PlantModel").getProperty("Plant");
                    // this.byId("id_Plant").setValue(sPlant);
                    // this.byId(oThat._sInputId).setValue(sPlant)
                    // this.oPlant = this.byId("id_Plant").getValue();
                }
            } else {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    const sPlant = oSelectedItem.getBindingContext("PlantModel").getProperty("Plant");
                    // this.byId("id_Plant").setValue(sPlant);
                    this.byId(oThat._sInputId).setValue(sPlant)
                    this.oPlant = this.byId("id_Plant").getValue();
                }
            }

            oEvent.getSource().getBinding("items").filter([]);
        },

        fnPlantSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value").trim(),
                oBinding = oEvent.getSource().getBinding("items"),
                oFilter = new sap.ui.model.Filter([
                    new Filter("Plant", sap.ui.model.FilterOperator.Contains, sValue),
                    new Filter("PlantDesc", sap.ui.model.FilterOperator.Contains, sValue)
                ]);
            var oFilter2 = new sap.ui.model.Filter(oFilter, false);
            oBinding.filter([oFilter2]);
        },
        // end of plant f4

        //Material F4
        onMaterialValueHelp: function (oEvent) {

            var oThat = this;
            var oSegmentBtn = this.byId("idSegmentedButton").getSelectedKey()
            var oInput = oEvent.getSource();
            oThat._sInputId = oInput.getId().split("--").pop();
            if (!oThat.material) {
                oThat.material = sap.ui.xmlfragment("com.olam.zgtmmtruckalloc.fragments.Material", oThat);
                oThat.oView.addDependent(oThat.material);
            }
            if (oSegmentBtn == "DISPLAY") {
                var oFilterPlantID = oThat.getView().byId("id_Plant1");
                var oFilterPlant = oFilterPlantID.getValue();
            } else {
                var oFilterPlantID = oThat.getView().byId("id_Plant");
                var oFilterPlant = oFilterPlantID.getValue();
            }
            var Filters = [
                new Filter("Plant", FilterOperator.EQ, oFilterPlant)
            ];
            var oDataModel = oThat.getOwnerComponent().getModel();
            oDataModel.read("/MaterialF4Set", {
                filters: Filters,
                success: function (oData, oResponse,) {
                    oThat.material.open();
                    var aResults = oData.results;
                    var material = new JSONModel();
                    material.setSizeLimit(aResults.length);
                    material.setData(aResults);
                    oThat.getView().setModel(material, "MaterialModel");

                },
                error: function (error) {

                },
            });


        },
        fnMaterialClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");

            if (!oSelectedItem) {
                return;
            }
            var obj = oSelectedItem.getBindingContext("MaterialModel").getObject();
            if (oSelectedItem) {
                const sMaterial = oSelectedItem.getBindingContext("MaterialModel").getProperty("Material");
                //this.byId("id_Material").setValue(sMaterial);
                this.byId(oThat._sInputId).setValue(sMaterial + ' - ' + obj.MaterialText)
                this.byId(oThat._sInputId).setTooltip(obj.MaterialText);
                // this.oMaterial = this.byId(oThat._sInputId).getValue();
                this.oMaterial = sMaterial;
                var oSegmentBtn = this.byId("idSegmentedButton").getSelectedKey()
                if (oSegmentBtn == "DISPLAY") {
                    this.byId("id_uom1").setValue(obj.Unit);
                } else {
                    this.byId("inp_uom").setValue(obj.Unit);
                }
            }
            oEvent.getSource().getBinding("items").filter([]);
        },

        fnMaterialSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value").trim(),
                oBinding = oEvent.getSource().getBinding("items"),
                oFilter = new sap.ui.model.Filter([
                    new Filter("Material", sap.ui.model.FilterOperator.Contains, sValue),
                    new Filter("MaterialText", sap.ui.model.FilterOperator.Contains, sValue)
                ]);
            var oFilter2 = new sap.ui.model.Filter(oFilter, false);
            oBinding.filter([oFilter2]);
        },

        // Transporter F4 not used check and comment
        oTransportValueHelp: function () {
            var oWeek = this.getView().getModel('selectedItem').getData().WeekNo;
            var sPlant = this.oPlant;
            var goFilters = [

                new Filter("Plant", FilterOperator.EQ, sPlant),
                new Filter("WeekNo", FilterOperator.EQ, oWeek),

            ];
            var oDataModel = this.getOwnerComponent().getModel();
            oDataModel.read("/TransporterAllocWeeklySet", {
                filters: goFilters,
                success: function (oData, oResponse,) {

                    var aResults = oData.results;
                    var oPlant = new JSONModel();
                    oPlant.setSizeLimit(aResults.length);
                    oPlant.setData(aResults);
                    this.getView().setModel(oPlant, "TransportModel");

                }.bind(this),
                error: function (error) {

                },
            });
        },

        // value help of transporter from Transporter Fragment
        onValueHelpTransport: async function (oEvent) {
            this.s4Path = oEvent.getSource().getBindingContext("TransportModel").getPath().split("/")[1]
            var oThat = this;
            if (!oThat.transport) {
                oThat.transport = sap.ui.xmlfragment("com.olam.zgtmmtruckalloc.fragments.AvailTransport", oThat);
                oThat.oView.addDependent(oThat.transport);
            }
            var oWeek = this.getView().getModel('selectedItem').getData().WeekNo;
            var oMonth = this.getView().getModel('selectedItem').getData().Month;
            var oYear = this.getView().getModel('selectedItem').getData().Year;
            var sPlant = this.oPlant;
            var goFilters = [
                new Filter("Plant", FilterOperator.EQ, sPlant),
                new Filter("WeekNo", FilterOperator.EQ, oWeek),
                new Filter("Month", FilterOperator.EQ, oMonth),
                new Filter("Year", FilterOperator.EQ, oYear),
            ];
            var oDataModel = this.getOwnerComponent().getModel();
            oDataModel.read("/TransporterAllocWeeklySet", {
                filters: goFilters,
                success: function (oData, oResponse,) {
                    oThat.transport.open();
                    var aResults = oData.results;
                    var oPlant = new JSONModel();
                    oPlant.setSizeLimit(aResults.length);
                    oPlant.setData(aResults);
                    this.getView().setModel(oPlant, "TransportModelF4");
                    // this.getView().getModel("TransportModelF4").setData(aResults);
                    //this.byId("id_addBtn").setEnabled(true);

                }.bind(this),
                error: function (error) {

                },
            });


        },

        fnTransporterSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value").trim(),
                oBinding = oEvent.getSource().getBinding("items"),
                oFilter = new sap.ui.model.Filter([
                    new Filter("Transporter", sap.ui.model.FilterOperator.Contains, sValue),
                    new Filter("TransporterName", sap.ui.model.FilterOperator.Contains, sValue)
                ]);
            var oFilter2 = new sap.ui.model.Filter(oFilter, false);
            oBinding.filter([oFilter2]);
        },


        // onSelectTransport: function (oEvent) {
        //     const oSelectedItem = oEvent.getParameter("listItem");
        //     const sPlant = oSelectedItem.getBindingContext().getProperty("Plant");
        //     this.byId("inpPlant").setValue(sPlant); // set selected value to input
        //     this.byId("transportDialog").close(); // close dialog
        // },
        // onCloseTransportDialog: function () {
        //     this.byId("transportDialog").close();
        // },





        // fnMaterialClose1: function (oEvent) {
        //     var oSelectedItem = oEvent.getParameter("selectedItem");

        //     if (!oSelectedItem) {
        //         return;
        //     }
        //     var obj = oSelectedItem.getBindingContext("MaterialModel").getObject();
        //     if (oSelectedItem) {
        //         const sMaterial = oSelectedItem.getBindingContext("MaterialModel").getProperty("Material");
        //         this.byId("id_Material1").setValue(sMaterial);
        //         this.oMaterial = this.byId("id_Material1").getValue();
        //         this.byId("id_uom1").setValue(obj.Unit);
        //     }
        //     oEvent.getSource().getBinding("items").filter([]);
        // },


        fnTransportClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var oTransportDataArr = [];
            this.byId("idTransporterAllocatedPerc").setValue("");
            if (!oSelectedItem) {
                return;
            }
            var vSelectedTransporter = oSelectedItem.getTitle();
            var vSelectedTransporterDesc = oSelectedItem.getDescription()
            var oTableModel = this.getView().getModel("TransportModel").getData();
            for (var item of oTableModel) {
                if (item.Transporter === vSelectedTransporter) {
                    // MessageBox.error("Transporter already selected. Please choose a different one or update the percentage.");
                    MessageBox.error(this._oBundle.getText("TransporterIdName") + ` ${vSelectedTransporter} (${vSelectedTransporterDesc}) ` + this._oBundle.getText("DuplicateTransporterError"));
                    return;
                }
            }
            var obj = oSelectedItem.getBindingContext("TransportModelF4").getObject();
            if (oSelectedItem) {
                oTransportDataArr.push(obj);
                const sTransporter = oSelectedItem.getBindingContext("TransportModelF4").getProperty("Transporter");
                this.getView().getModel("TransportModel").getData()[this.s4Path].Transporter = obj.Transporter;
                this.getView().getModel("TransportModel").getData()[this.s4Path].TransporterName = obj.TransporterName;
                this.getView().getModel("TransportModel").getData()[this.s4Path].WeekNo = obj.WeekNo;
                this.getView().getModel("TransportModel").getData()[this.s4Path].Ranking = obj.Ranking;
                this.getView().getModel("TransportModel").getData()[this.s4Path].Quantity = obj.Quantity;
                this.getView().getModel("TransportModel").getData()[this.s4Path].AvailableTrucks = obj.AvailableTrucks;
                this.getView().getModel("TransportModel").getData()[this.s4Path].NoOfTrucks = obj.NoOfTrucks;
                this.getView().getModel("TransportModel").getData()[this.s4Path].Opentrucks = obj.Opentrucks;
                this.getView().getModel("TransportModel").getData()[this.s4Path].Inprogress = obj.Inprogress;
                this.getView().getModel("TransportModel").getData()[this.s4Path].Percentage = obj.Percentage;
                // this.byId("id_sTransporter").setValue(sTransporter);
                // this.byId("id_sRank").setText(obj.Ranking);
                //  this.byId("id_sAvailability").setText(obj.AvailableTrucks);
                // this.getView().getModel("oAllocationModel").setData(oTransportDataArr);
                // this.getView().getModel("oAllocationModel").getData().push(obj); 
                this.getView().getModel("TransportModel").updateBindings(true);
                this.getView().getModel("TransportModel").refresh(true);

            }
            oEvent.getSource().getBinding("items").filter([]);
        },
        //******************************************Change & Live Change**************************** */
        // onMonthlyQuantity: function (oEvent) {
        //     const oInput = oEvent.getSource().getValue();
        //     this.byId("id_month").setText(oInput);

        // },
        onMonthlyQuantity: function (oEvent) {
            var oValue = oEvent.getParameter("value");
            if (oValue) {
                if (this.byId('id_PageTitle').getText() === "Create") {
                    this.getView().byId("id_monthFilter").setValueState("None");
                    // this.getView().byId("id_monthFilter").setValueState("None");
                    this.getView().getModel("TableModel").getData().MonthlyQty = oValue; //- this.getView().getModel("TableModel").getData().MonthlyQty;
                    this.getView().getModel("TableModel").refresh(true);
                    this.getView().getModel("TableModel").updateBindings(true);
                    this.byId('id_SubmitBtn').setVisible(true);
                    this.byId('id_CancelBtn').setVisible(true);
                }
                // if(this.byId('id_PageTitle').getText() === "Change"){
                //         var oUsedQuantity = 0;
                //         for(var i=0; i<this.getView().getModel("TableModel").getData().length; i++){
                //             oUsedQuantity = Number(this.getView().getModel("TableModel").getData()[i].Quantity)+oUsedQuantity;
                //         }
                //         MessageBox.information();
                //        this.getView().getModel("TableModel").getData().MonthlyQty = Number(oValue) - oUsedQuantity; 
                //        this.getView().getModel("TableModel").refresh(true);
                //        this.getView().getModel("TableModel").updateBindings(true)
                //     }
                this.getView().byId("id_monthFilter").setValueState("None");
            } else {
                this.getView().getModel("TableModel").getData().MonthlyQty = 0;
                this.getView().byId("id_monthFilter").setValueState("Error");
                this.getView().getModel("TableModel").refresh(true);
                this.getView().getModel("TableModel").updateBindings(true);
            }
        },


        onPercentageChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sContext = oInput.getBindingContext("TransportModel");
            var sPath = sContext.getPath();
            var sObj = sContext.getObject();
            var iTotalQuantity = this.getView().byId("id_qty").getValue()
            const oVM = this.getView().getModel("TransportModel");
            var aItems = oVM.getData();

            // Get the entered percentage
            var iPerc = parseFloat(oEvent.getParameter("value")) || 0;
            // Get the header quantity from model
            var iHeaderQty = parseFloat(iTotalQuantity) || 0;

            // Calculate new quantity
            var iRowQty = (iHeaderQty * iPerc) / 100;
            // Update the quantity field in this row
            oVM.setProperty(sPath + "/Quantity", iRowQty);

            //fill truck remaining and truck allocations
            const fTruckReq = this.getView().getModel("selectedItem").getProperty("/NoOfTrucks");
            var fAlloc = +(iPerc / 100 * fTruckReq).toFixed(2); // keep two decimals
            oVM.setProperty(sPath + "/NoOfTrucks", fAlloc);

            var iTotal = this._sumNoOfTrucks(aItems, fTruckReq);
            // if (iTotal === fTruckReq) {
            //     this.byId("id_addBtn").setEnabled(false);
            // } else {
            //     this.byId("id_addBtn").setEnabled(true);
            // }

            if (iTotal > fTruckReq) {
                var iRemaining = oInput.getValue();
                oInput.setValue(iRemaining > 0 ? iRemaining : 0);
                fAlloc = fAlloc > fTruckReq ? 0 : fAlloc;
                oVM.setProperty(sPath + "/Allocation", fAlloc);
                this.byId("id_TransporterSave").setEnabled(false);
                oInput.setValueState("Error");
                oInput.setValueStateText(this.getView().getModel("i18n").getResourceBundle().getText("Msg1") + " " + +fTruckReq);
                // MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("Msg1")  + fTruckReq);
            } else {
                oInput.setValueState("None");
                this.byId("id_TransporterSave").setEnabled(true);
            }

            //caluclate remaing Percentage at top
            // var aItems = oHeaderData.HeaderToItemNav.results;
            //var iTotalQuantity = parseFloat(oHeaderData.Quantity) || 0; // e.g., 5000

            // Loop through each row and recalculate percentage
            aItems.forEach(function (oRow) {
                var iRowQuantity = parseFloat(oRow.Quantity) || 0;
                if (iTotalQuantity > 0) {
                    // oRow.Percentage = ((iRowQuantity / iTotalQuantity) * 100).toFixed(2);
                    oRow.Percentage = ((iRowQuantity / iTotalQuantity) * 100);
                } else {
                    oRow.Percentage = 0;
                    //oRow.Percentage = ((iRowQuantity / iTotalQuantity) * 100);
                    //oRow.Percentage = oRow.Percentage;
                }
                // 3️⃣ Set the Remaining % directly to the text control by ID
                //  oThat.byId("id_RPercent").setText("Remaining: " + iRemaining.toFixed(2) + "%");

            });
            // 2️⃣ Calculate remaining percentage
            sObj.Percentage = iPerc;
            oVM.refresh(true)
            var iSum = aItems.reduce(function (acc, row) {
                return acc + (parseFloat(row.Percentage) || 0);
            }, 0);
            var iRemaining = 100 - iSum;
            if (iRemaining < 0) {
                iRemaining = 0;
                // MessageToast.show("Total Percentage cannot exceed 100")
                oInput.setValueState("Error");
                oInput.setValueStateText("Total Percentage cannot exceed 100");

                return;
                //iRemaining = iRemaining;
            } else {
                oInput.setValueState("None");
                oInput.setValueStateText("");
            }
            // Store in header model for binding
            var oHeaderData = this.getView().getModel("selectedItem");
            // oHeaderData.getData().RemainingPercentage = iRemaining.toFixed(2);
            oHeaderData.getData().RemainingPercentage = iRemaining;
            oHeaderData.refresh(true);
        },

        // onSwitchChange: function (oEvent) {
        //     var oSwitch = oEvent.getSource();
        //     var bState = oSwitch.getState(); // true/false
        //     //var oTable = this.byId("yourTableId"); // replace with your table id
        //     var oContext = oSwitch.getBindingContext("TableModel");
        //     var oData = oContext.getObject();

        //     if (bState) {
        //         // If percentage mode
        //         oData.QuantityVisible = false;
        //         oData.QtyPerVisible = true;
        //     } else {
        //         // If number mode
        //         oData.QuantityVisible = true;
        //         oData.QtyPerVisible = false;
        //     }

        //     // Update model to reflect changes
        //     oContext.getModel().refresh(true);
        // },
        onSwitchChange: function (oEvent) {
            var bState = oEvent.getParameter("state"); // true → Percent, false → Numbers
            var oContext = oEvent.getSource().getBindingContext("TableModel");
            var oModel = oContext.getModel();
            var sPath = oContext.getPath();

            // Update the flag based on switch state
            oModel.setProperty(sPath + "/Qtyperflag", bState ? "P" : "Q");

            // Update visibility properties
            oModel.setProperty(sPath + "/QtyPerVisible", bState);
            oModel.setProperty(sPath + "/QuantityVisible", !bState);
        },


        onWkQntyLiveChange: function (oEvent) {
            const oMthqtyId = oThat.getView().byId("id_monthFilter");
            const oTotalMonthlyQuantity = parseFloat(oMthqtyId.getValue()) || 0;

            if (oTotalMonthlyQuantity === 0) {
                oMthqtyId.setValueState("Error");
                oMthqtyId.setValueStateText("Please enter monthly quantity");
                return;
            } else {
                oMthqtyId.setValueState("None");
            }

            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("TableModel");
            const oTableModel = oSource.getModel("TableModel");
            const onSubmitBtn = oThat.byId("id_SubmitBtn");

            // Raw user entry
            let oInputValue = parseFloat(oSource.getValue().replace(",", ".")) || 0;

            // Switch mode check
            const oHBox = oSource.getParent();
            const oSwitch = oHBox.getItems()[0];
            const sSwitchMode = oSwitch.getState() ? "Percent" : "Numbers";

            let oCalculatedQuantity = 0;
            let oCalculatedPercent = 0;

            if (sSwitchMode === "Percent") {
                if (oInputValue > 100) {
                    oSource.setValueState("Error");
                    oSource.setValueStateText("Percentage cannot be greater than 100");
                    onSubmitBtn.setEnabled(false);
                    oTableModel.setProperty(oContext.getPath() + "/enableInventory", false);
                    return;
                }
                oSource.setValueState("None");


                oCalculatedQuantity = (oInputValue / 100) * oTotalMonthlyQuantity;
                oCalculatedPercent = oInputValue;

            } else {
                if (oInputValue > oTotalMonthlyQuantity) {
                    oSource.setValueState("Error");
                    oSource.setValueStateText("Quantity cannot be greater than total monthly quantity");
                    onSubmitBtn.setEnabled(false);
                    oTableModel.setProperty(oContext.getPath() + "/enableInventory", false);
                    return;
                }
                oSource.setValueState("None");

                oCalculatedQuantity = oInputValue;
                oCalculatedPercent = (oInputValue / oTotalMonthlyQuantity) * 100;
            }
            // ✅ Fix to 2 decimal places
            oCalculatedQuantity = parseFloat(oCalculatedQuantity.toFixed(2));
            oCalculatedPercent = parseFloat(oCalculatedPercent.toFixed(2));

            // Update BOTH fields
            oContext.getObject().Quantity = oCalculatedQuantity;
            oContext.getObject().QtyPer = oCalculatedPercent;

            const aResults = oTableModel.getData();
            const fUsedQty = aResults.reduce((sum, row) => sum + (parseFloat(row.Quantity) || 0), 0);
            const fRemaining = oTotalMonthlyQuantity - fUsedQty;

            if(fRemaining < 0){
               // sap.m.MessageToast.show("Please check the Remaining Monthly Quantity, it's in Negitive Values \n\n Please Check Once");
                 oThat.byId("id_month").setText();
                 //oThat.byId("id_month").setValueState("Error");

            }else{
                oThat.byId("id_month").setText(fRemaining);
                //oThat.byId("id_month").setValueState("None");
            }

            if (fUsedQty > oTotalMonthlyQuantity) {
                oSource.setValueState("Error");
                oSource.setValueStateText("Total quantity cannot exceed " + oTotalMonthlyQuantity);
                oTableModel.setProperty(oContext.getPath() + "/enableInventory", false);
                onSubmitBtn.setEnabled(false);
                return;
            }

            oTableModel.setProperty(oContext.getPath() + "/enableInventory", true);
            onSubmitBtn.setEnabled(true);

            if (oCalculatedQuantity > 0) {
                const truckRequired = Math.ceil(oCalculatedQuantity / 25);
                oTableModel.setProperty(oContext.getPath() + "/NoOfTrucks", truckRequired);
            } else {
                oTableModel.setProperty(oContext.getPath() + "/NoOfTrucks", 0);
            }

            oTableModel.refresh(true);
        },



        // comment , not required quantitychanges
        onQuantityChange10: function (oEvent) {

            const oInput = oEvent.getSource(); // the percentage <Input>
            const oCtx = oInput.getBindingContext("TransportModel"); // row context
            const oModel = oCtx.getModel("TransportModel"); // "view" model
            const sData = oModel.getData();
            const fPerc = parseFloat(oInput.getValue()) || 0; // safety: NaN → 0
            const fTruckReq = this.getView().getModel("selectedItem").getProperty("/NoOfTrucks");
            var fAlloc = +(fPerc / 100 * fTruckReq).toFixed(2); // keep two decimals
            oModel.setProperty(oCtx.getPath() + "/NoOfTrucks", fAlloc);

            var iTotal = this._sumNoOfTrucks(sData, fTruckReq);
            // if (iTotal === fTruckReq) {
            //     this.byId("id_addBtn").setEnabled(false);
            // } else {
            //     this.byId("id_addBtn").setEnabled(true);
            // }

            if (iTotal > fTruckReq) {
                var iRemaining = oInput.getValue();
                oInput.setValue(iRemaining > 0 ? iRemaining : 0);
                fAlloc = fAlloc > fTruckReq ? 0 : fAlloc;
                oModel.setProperty(oCtx.getPath() + "/Allocation", fAlloc);
                oInput.setValueState("Error");
                oInput.setValueStateText("Enter Valid Number");
                sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("Msg1") + fTruckReq);
            } else {
                oInput.setValueState("None");
            }


        },
        onQuantityChange2: function (oEvent) {

            const oInput = oEvent.getSource(); // the percentage <Input>
            const oContext = oInput.getBindingContext("TableModel"); // row context
            const oModel = oContext.getModel("TableModel"); // "view" model
            const sData = oModel.getData();
            const fPerc = parseFloat(oInput.getValue()) || 0; // safety: NaN → 0
            const fTruckReq = this.getView().getModel("selectedItem").getProperty("/NoOfTrucks");
            var fAlloc = +(fPerc / 100 * fTruckReq).toFixed(2); // keep two decimals
            oModel.setProperty(oCtx.getPath() + "/NoOfTrucks", fAlloc);

            // var iTotal = this.sumNoOfTrucks(sData, fTruckReq);
            // if (iTotal === fTruckReq) {
            //     this.byId("id_addBtn").setEnabled(false);
            // } else {
            //     this.byId("id_addBtn").setEnabled(true);
            // }

            // if (iTotal > fTruckReq) {
            //     var iRemaining = oInput.getValue();
            //     oInput.setValue(iRemaining > 0 ? iRemaining : 0);
            //     fAlloc = fAlloc > fTruckReq ? 0 : fAlloc;
            //     oModel.setProperty(oCtx.getPath() + "/Allocation", fAlloc);
            //     oInput.setValueState("Error");
            //     oInput.setValueStateText("Enter Valid Number");
            //     sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("Msg1") + fTruckReq);
            // } else {
            //     oInput.setValueState("None");
            // }


        },
        //****************************************** End of Change & Live Change**************************** */


        //*********************************Actions*****************************************************
        // filters clear Button
        onClearFilters: function () {
            this.byId("id_Plant").setValue('');
            // this.byId("id_Material").setValue('');
            // this.byId("inp_uom").setValue('');
            this.byId("id_monthFilter").setValue('');
            // this.byId("id_SlectedKey").setSelectedKey();
            this.byId("id_MonthCombo").setSelectedKey("")
            this.byId("id_MonthlyFilter").setVisible(false);
            this.byId("id_monthFilter").setValue(0);
            this.getView().getModel("TableModel").setData([]);
            this.getView().getModel("TableModel").refresh(true);
        },



        // on Go Button

        onGo: function () {
            var oView = this.getView();
            var oFilterPPID = oView.byId("id_MonthCombo");
            var oFilterYearID = oView.byId("idYearPicker");
            var oFilterPlantID = oView.byId("id_Plant");
            // var oFilterMaterialID = oView.byId("id_Material");
            //  var  oTotalMonthlyQuantity = oView.byId("id_monthFilter").getValue()
            var oTotalMonthlyQuantityID = oView.byId("id_monthFilter");

            var oFilterMC = oFilterPPID.getSelectedItem();
            if (oFilterMC) {
                var oFilterMC1 = oFilterMC.getKey();
            }
            // var oFilterPP1 =  this.getView().byId("id_SlectedKey").getKey();

            // var pFilter = oFilterPP1 ? oFilterPP1 : "";

            var oFilterYear = oFilterYearID.getValue();
            var oFilterPlant = oFilterPlantID.getValue();
            // var oFilterMaterial = oFilterMaterialID.getValue();
            // var oFilterMaterial = this.oMaterial;
            var oFilterMaterial = "";
            var oSegmentBtn = this.byId("idSegmentedButton").getSelectedKey();
            if (oSegmentBtn === "CREATE") {
                var Flag = "I"
            } else if (oSegmentBtn === "CHANGE") {
                var Flag = "C"
            }


            var goFilters = [
                new Filter("Plant", FilterOperator.EQ, oFilterPlant),
                new Filter("Material", FilterOperator.EQ, oFilterMaterial),
                new Filter("Month", FilterOperator.EQ, oFilterMC1),
                new Filter("Year", FilterOperator.EQ, oFilterYear),
                new Filter("Flag", FilterOperator.EQ, Flag)
            ];
            // if (!oFilterPlant || !oFilterMaterial || !oFilterMC || !oFilterYear) {
            //     MessageToast.show("Please enter all required filters.");
            //     return;
            // }
            if (!oFilterPlant) {
                MessageToast.show("Please Select the Plant");
                return;
                // } else if (!oFilterMaterial) {
                //     MessageToast.show("Please Select the Material");
                //     return;
            } else if (!oFilterMC) {
                MessageToast.show("Please Select the Month");
                return;
            } else if (!oFilterYear) {
                MessageToast.show("Please Select the Year");
                return;
            }
            //  var oThat = this
            oThat.byId("id_month").setText("0");
            var oDataModel = this.getOwnerComponent().getModel();
            oThat.BusyDialog.open();
            oDataModel.read("/HeaderSet", {
                filters: goFilters,
                urlParameters: {
                    $expand: "HeaderToItemNav,MessageSet"
                },
                //         success: function (oData, oResponse, ) {

                //             var aResults = oData.results;
                //             var MonthlyQty = oData.results[0].Mquan;
                //             var aTransportersAllWeeks = {}; // key by weekNo
                //             oData.results.forEach(function (header) {
                //                 var weekNo = header.WeekNo;
                //                 var aTransporters = header.HeaderToItemNav.results || [];
                //                 aTransportersAllWeeks[weekNo] = aTransporters;
                //             });
                //             // Store in a model
                //             var oItemData = new sap.ui.model.json.JSONModel(aTransportersAllWeeks);
                //             this.getView().setModel(oItemData, "ItemTransportData");
                //             oThat.getView().getModel('ItemTransportData').setData(aTransportersAllWeeks);
                //             oThat.getView().getModel('ItemTransportData').refresh();


                //             oThat.getView().getModel('TableModel').setData(aResults);
                //             oThat.byId('id_MonthlyFilter').setVisible(true);
                //             var oTabletransport = new JSONModel();
                //             //  oTableModel.setSizeLimit(aResults.length);
                //             //    oTableModel.setData(aResults);
                //             var oTabletransport = new JSONModel([]);
                //             oThat.getView().setModel(oTabletransport, "oAllocationModel");
                //             oThat.byId("id_monthFilter").setValue(MonthlyQty);
                //             //BusyIndicator.hide();
                //         }.bind(this),

                //         error: function (error) {
                //             //  BusyIndicator.hide();
                //             // MessageToast.show(oThat.getI18nText("tableerrorMessage"));
                //             // MessageBox.show(error.message);
                //             //  MessageBox.error(error.responseText);
                //         },
                //     });
                // },

                success: function (oData, oResponse) {
                    oThat.BusyDialog.close();
                    var aResults = oData.results;
                    var vMsgStatus = aResults.length ? aResults[0]?.MessageSet?.results[0]?.MESSAGE.includes("Rejected") : false;
                    var vScreenName = this.byId('id_PageTitle').getText();
                    var isChangeRejected = vMsgStatus && vScreenName === 'Change';
                    if (aResults[0].MessageSet.results.length !== 0) {
                        // if (isChangeRejected) {
                        MessageBox.information(aResults[0].MessageSet.results[0].MESSAGE);
                         var oTableModel = this.getView().getModel("TableModel");
                        oTableModel.setData([]);
                        return;
                    }
                    // MessageBox.information(aResults[0].MessageSet.results[0].MESSAGE);
                    this.byId("id_MonthlyFilter").setVisible(true);
                    this.getView().byId("id_monthFilter").setValueState("None");
                    aResults.forEach(function (row) {
                        row.enableInventory = true; // initially enabled
                        if (row.Qtyperflag == "Q") {
                            row.QuantityVisible = true; // Show number input
                        } else {
                            row.QtyPerVisible = false; // Hide percentage input
                        }
                    });
                    // var oJSONModel = new JSONModel(aResults);
                    //this.getView().setModel(oJSONModel, "TableModel");
                    var oTableModel = this.getView().getModel("TableModel");
                    oTableModel.setData(aResults);
                    if (aResults.length > 0 && aResults[0].Mquan) {
                        this.byId("id_monthFilter").setValue(aResults[0].Mquan);
                    }
                    var fUsedQty = aResults.reduce(function (sum, row) {
                        return sum + (parseFloat(row.Quantity) || 0);
                    }, 0);
                    var oTotalMonthlyQuantity = oTotalMonthlyQuantityID.getValue();
                    if (oTotalMonthlyQuantity == "" || undefined) {
                        oTotalMonthlyQuantity = "0";
                    }
                    var fRemaining = oTotalMonthlyQuantity - fUsedQty;
                    oThat.byId("id_month").setText(fRemaining);
                    if(fRemaining < 0){
                         oThat.byId("id_month").setText(0);
                         this.byId("id_monthFilter").setValue(aResults.reduce((sum, row) => sum + (parseFloat(row.Quantity) || 0), 0));
                         this.getView().byId("id_monthFilter").setValueState("None");
                    }

                    if (this.byId('id_PageTitle').getText() === "Create" && this.getView().byId("id_monthFilter").getValue() === "0") {
                        // MessageToast.show("Please enter Total Month Quantity...");
                        this.getView().byId("id_monthFilter").setValueState("Error");
                        this.getView().byId("id_monthFilter").setValueStateText("Please Enter Quantity");
                    } else {
                        this.getView().byId("id_monthFilter").setValueState("None");
                    }
                    for(var k=0; k<this.getView().getModel("TableModel").getData().length; k++){
                        if(this.getView().getModel("TableModel").getData()[k].Status === ''){
                            this.getView().getModel("TableModel").getData()[k].Status = "Yet to proposed";
                        }
                    }

                    var oStatusModifiedData = oData.results.filter(function (item) {
                        return item.Status === "Proposed";
                    });
                    if (oStatusModifiedData.length > 0 && oSegmentBtn === "CREATE" && fRemaining > 0) {
                        MessageBox.information(this.getView().getModel("i18n").getResourceBundle().getText("dataupdated") + fRemaining);
                    }
                    // else if (oStatusModifiedData.length > 0 && oSegmentBtn === "CREATE") {
                    //     this.byId("id_PageTitle").setText("Change");
                    //     this.byId('idSegmentedButton').setSelectedKey("CHANGE");
                    //     this.byId('id_PageTitle').setText("Change");
                    //     this.byId('id_MonthQunaty1').setVisible(true);
                    //     this.byId('id_month').setVisible(true);
                    //     this.byId("id_MonthlyFilter").setVisible(false);
                    //     this.byId("id_FilterYear").setVisible(false);
                    //     this.byId("id_FilterUOM").setVisible(false);
                    //     this.byId("id_FilterYear").setVisible(true);
                    //     this.byId("id_FilterPlant").setVisible(true);
                    //     this.byId("id_FilterMaterial").setVisible(true);
                    //     this.byId('id_SubmitBtn').setVisible(true);
                    //     this.byId('id_ApproveBtn').setVisible(false);
                    //     this.byId('id_RejectBtn').setVisible(false);
                    //     this.byId("id_FilterMonth").setVisible(true);
                    //     this.byId("id_FilterUOM").setVisible(true);
                    //     this.byId("id_Plant").setValue('');
                    //     this.byId("id_Material").setValue('');
                    //     this.byId("inp_uom").setValue('');
                    //     this.byId("id_monthFilter").setValue('');
                    //     this.byId("id_SlectedKey").setKey();
                    //     this.getView().getModel('TableModel').setData();
                    //     this.getView().getModel('TableModel').refresh();
                    //     this.getView().getModel('VISI').getData().table = true;
                    //     this.getView().getModel('VISI').getData().FilterItem = true;
                    //     this.getView().getModel('VISI').getData().treetable = false;
                    //     this.getView().getModel('VISI').getData().FormDisp = false;
                    //     this.getView().getModel('VISI').refresh(true);
                    //     this.getView().getModel("TableModel").setProperty("/", [])
                    //     MessageBox.information("No New monthly quantity creation has been available for...\n\nSelected Plant:" + oStatusModifiedData[0].Plant + " " + "Material:" + oStatusModifiedData[0].Material + " " + "Month & Year" + " " + oStatusModifiedData[0].Month + "-" + oStatusModifiedData[0].Year + "\n\nSo Navigating to Edit Page," + " " + "Please Modify here if You Want...");

                    // } else {

                    // }
                    if (oSegmentBtn === "CREATE" && this.byId("id_monthFilter").getValue()) {
                        this.byId('id_SubmitBtn').setVisible(true);
                        this.byId('id_CancelBtn').setVisible(true);
                    }
                    if (oSegmentBtn === "CHANGE") {
                        this.byId("id_MonthlyFilter").setVisible(false);
                        this.byId('id_SubmitBtn').setVisible(true);
                        this.byId('id_CancelBtn').setVisible(true);
                    }
                    // } 
                    // else {
                    //     MessageBox.information(aResults[0].MessageSet.results[0].MESSAGE)
                    //     this.getView().getModel("TableModel").setData([]);
                    // }
                }.bind(this),
                error: function (oError) {
                    oThat.BusyDialog.close();
                    MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                    // MessageBox.error(oError.responseText);
                    // MessageBox.error("Failed to load data");
                }
            })
        },


        // open transport dialog or fragment
        onTransportDialog: function (oEvent) {
            // this._clearOldAttachemts(); // clear old attachmenst before fragent opens
            // const oTable = this.byId("idPlanTable");
            // const oRow = oEvent.getSource(); // Row template
            // // const rowIndex = oTable.indexOfRow(oRow);
            // //     //const oContext = oTable.getContextByIndex(rowIndex);
            // const oContext = oRow.getBindingContext("TableModel")
            // const oRowData = oContext.getObject();
            // just to avoid fast clicks for busy indicator to trigger

            // var oBusy = new sap.m.BusyDialog({
            //         title: "Loading",
            //         text: "Please wait..."
            //     });
            //     oBusy.open();
            var oBusyDialog = new sap.m.BusyDialog();
            // oBusyDialog.open();

            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext("TableModel");
            var oHeaderData = oContext.getObject();
            this.vSelectedRowSPath = oEvent.getSource().getBindingContext("TableModel").sPath;
            // this.oClonedTransporterData = [];	



            this.oClonedTransporterData = JSON.parse(JSON.stringify(oHeaderData.HeaderToItemNav.results));
            // Extract HeaderToItemNav
            if (this.getView().getModel("TableModel").getData().MonthlyQty == '0' && this.getView().byId("id_monthFilter").getValueState() === "Error") {
                MessageBox.error("Please enter Total Monthly Quantity...");
                return;
            }
            if (oHeaderData.Quantity === "0.00" || oHeaderData.Quantity === 0 || oHeaderData.Quantity === "0") {
                MessageToast.show("Please enter Quantity...")
            } else {
                oBusyDialog.open();
                var oFragHeadModel = new JSONModel(oHeaderData);
                this.getView().setModel(oFragHeadModel, "selectedItem")
                var aItems = oHeaderData.HeaderToItemNav.results;
                var iTotalQuantity = parseFloat(oHeaderData.Quantity) || 0; // e.g., 5000

                // Loop through each row and recalculate percentage
                aItems.forEach(function (oRow) {
                    // var iRowQuantity = parseFloat(oRow.Quantity) || 0;
                    oRow.Quantity = (iTotalQuantity * oRow.Percentage) / 100;
                    oRow.NoOfTrucks = oRow.Quantity / 25;
                    // oRow.Percentage = 0;
                    //  aItems.enableSave = true;// add proprerty to enable/disable save. will use later
                    // if (iTotalQuantity > 0) {
                    //     // oRow.Percentage = ((iRowQuantity / iTotalQuantity) * 100).toFixed(2);
                    //     oRow.Percentage = ((iRowQuantity / iTotalQuantity) * 100);
                    // } else {
                    //     oRow.Percentage = 0;
                    //     //oRow.Percentage = oRow.Percentage;
                    // }
                    // 3️⃣ Set the Remaining % directly to the text control by ID
                    //  oThat.byId("id_RPercent").setText("Remaining: " + iRemaining.toFixed(2) + "%");

                });
                // 2️⃣ Calculate remaining percentage
                var iSum = aItems.reduce(function (acc, row) {
                    return acc + (parseFloat(row.Percentage) || 0);
                }, 0);
                var iRemaining = 100 - iSum;
                if (iRemaining < 0) {
                    iRemaining = 0;
                }
                //     var sFragmentId = this.getView().getId(); // view ID prefix
                //     var oTxtRemaining = Fragment.byId(sFragmentId, "id_RPercent");
                //     if (oTxtRemaining) {
                //        oTxtRemaining.setText("Remaining: " + iRemaining.toFixed(2) + "%");
                //   }

                // Store in header model for binding
                // oHeaderData.RemainingPercentage = iRemaining === 100 ? iRemaining : iRemaining.toFixed(2);
                oHeaderData.RemainingPercentage = iRemaining;
                oThat.getView().getModel("selectedItem").refresh(true);

                var oItemModel = new JSONModel(aItems);
                this.getView().setModel(oItemModel, "TransportModel");
                if (!this._oTransporterDialog) {
                    Fragment.load({
                        id: this.getView().getId(),
                        name: "com.olam.zgtmmtruckalloc.fragments.Transporter",
                        controller: this
                    }).then(function (oDialog) {
                        this._oTransporterDialog = oDialog;
                        this.getView().addDependent(oDialog);
                        // this.onTransportData();
                        //  this._oTransporterDialog.setModel(oItemModel, "TransportModel");
                        //  this._clearOldAttachemts(); // clear old attachmenst before fragent opens
                        oDialog.open();
                        oBusyDialog.close(); // Close after dialog is open
                        // setTimeout(function () {
                        //     // BusyIndicator.show(0);
                        //     // this._bindAttachmentData(this._selectedRowData);
                        // }.bind(this), 100);

                    }.bind(this));
                } else {
                    this._oTransporterDialog.open();
                    oBusyDialog.close(); // Close after dialog is open

                    // setTimeout(function () {
                    //     // BusyIndicator.show(0);
                    //     //this._clearOldAttachemts();
                    //     // this._bindAttachmentData(this._selectedRowData);
                    // }.bind(this), 100);

                }
                //   this.byId("id_addBtn").setEnabled(true);
            }
        },
        onCloseDialog: function () {
            if (this.getView().getModel('TransportModel').getData().length >= 1) {
                if (this.getView().getModel('TransportModel').getData()[0].Transporter === "" || this.getView().getModel('TransportModel').getData()[0].AvailableTrucks === "") {
                    MessageBox.information(this._oBundle.getText("unsavedData"), {
                        title: "Information",
                        styleClass: "sapUiSizeCompact",
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        onClose: function (oAction) {
                            if (oAction === "YES") {
                                this.getView().getModel('TransportModel').getData().splice(0, 1);
                                this.getView().getModel('TransportModel').refresh(true);
                                this.getView().getModel('TransportModel').updateBindings(true);
                                this._oTransporterDialog.close();
                            }
                        }.bind(this)
                    });
                } else {
                    this._oTransporterDialog.close();
                }
            } else {
                this._oTransporterDialog.close();
            }
            //this._oTransporterDialog.close();
            // this.getView().getModel('TransportModel').setData([]);
        },

        // addnew row on fragment
        onAddRow: function () {
            //var oTable = this.getView().byId("myTable");
            // var oTransportModel = this.getOwnerComponent().getModel("TransportModel");
            var aFragHeadModel = oThat.getView().getModel("selectedItem").getData();
            var sTopQty = aFragHeadModel.Quantity;
            var nTopQty = parseFloat(sTopQty) || 0;
            var oTransportModel = oThat.getView().getModel("TransportModel");
            var aData = oTransportModel.getProperty("/") || [];
            var totalQuantity = 0;
            aData.forEach(function (item) {
                var qty = parseFloat(item.Quantity) || 0;
                totalQuantity += qty;
            });
            if (totalQuantity >= nTopQty) {
                MessageBox.error("Cannot add more rows. Total quantity exceeds the allowed maximum of " + nTopQty);
                return;
            }
            // var aData = [];
            var iNewSerial = aData.length + 1;
            var weekNo = this.getView().getModel('selectedItem').getData().WeekNo;

            var newRow = {
                serialNo: iNewSerial,
                WeekNo: weekNo,
                Allocation: "",
                AvailableTrucks: "",
                Deletion: "",
                Material: "",
                Month: "",
                NoOfTrucks: "",
                Percentage: "",
                Plant: "",
                Quantity: "",
                Ranking: "",
                Transporter: "",
                TransporterName: "",
                Uom: "",
                Volume: "",
                // WeekSdate:"",
                //WeekEdate:"",
                Year: "",
            };
            aData.push(newRow);
            oTransportModel.setProperty("/", aData);
            oTransportModel.refresh();
            //  this.getOwnerComponent().getModel("TransportModel").setData(aData);



            //  var oTransportModel = new JSONModel(aData);
            //   //  oTransportModel.setData(aData);
            //     this.getView().setModel(oTransportModel, "TransportModel");



            // this.getView().getModel("TransportModel").setData(aData);
            this.getView().getModel("TransportModel").updateBindings(true);
            //this.byId("id_addBtn").setEnabled(false);
        },




        // Save Dialog
        onSave: function (oEvent, sPath) {
            //  var sAction = oEvent.getSource().getText(); // "Approve" or "Reject"
            //  var sFlag = (sAction === "Delete") ? "X" : ""; // You can map this based on constants if needed
            //  var sPath = sPath;

            // oThat.BusyDialog.open();
            var oBusyDialog = new sap.m.BusyDialog();
            //oBusyDialog.open();


            var oModel = this.getView().getModel('selectedItem').getData();
            var oTransporter = this.getView().getModel('TransportModel');
            var allocationModel = oTransporter.getData();
            var WeekEdate = this.getView().byId("id_weekEDate").getValue();
            var WeekSdate = this.getView().byId("id_weekSDate").getValue();

            //checking if items are added or not in table, atleast one..
            if (allocationModel.length === 0) {
                MessageBox.error(this._oBundle.getText("MissingTransporterRow"));
                return;
            }
            let isItemChanged = true;
            if (this.oClonedTransporterData.length) {
                isItemChanged = this.oClonedTransporterData.some(item =>
                    !allocationModel.some(item1 =>
                        item.Transporter === item1.Transporter &&
                        item.Percentage === item1.Percentage
                    )
                );
            }

            if (!isItemChanged) {
                MessageToast.show(this._oBundle.getText("Nochangesmade"));
                this._oTransporterDialog.close();
                return;
            }

            var TransportModel = [];
            for (var i = 0; i < allocationModel.length; i++) {
                if (allocationModel[i].Transporter) {
                    TransportModel.push({
                        "Plant": allocationModel[i].Plant,
                        "Month": allocationModel[i].Month,
                        "WeekSdate": WeekSdate,
                        "WeekEdate": WeekEdate,
                        "Year": allocationModel[i].Year,
                        "WeekNo": allocationModel[i].WeekNo,
                        "Transporter": allocationModel[i].Transporter,
                        "TransporterName": allocationModel[i].TransporterName,
                        "Ranking": allocationModel[i].Ranking,
                        "Material": allocationModel[i].Material,
                        //"Quantity": allocationModel[i].Quantity+"."+"00",
                        "Percentage": String(allocationModel[i].Percentage),
                        "Quantity": String(allocationModel[i].Quantity),
                        "AvailableTrucks": allocationModel[i].AvailableTrucks,
                        "Volume": allocationModel[i].Volume,
                        "NoOfTrucks": allocationModel[i].NoOfTrucks,
                        "Deletion": allocationModel[i].Deletion
                    })
                } else {
                    MessageBox.error(i + 1 + " " + "Row is not filled \n\n Please fill the " + `${i + 1}` + " " + "Row Item" + " " + "OR" + " " + "Delete.");
                    return;
                }
                //        if(oEvent === "Delete"){
                //     //sFlag = "X"
                //    }
            }
            oBusyDialog.open();
            // TransporterAllocWeeklySet.push(TransportModel);
            var oPlant = this.oPlant;
            var sYear = this.getView().byId('idYearPicker').getValue();
            var sMonth = this.getView().byId('id_MonthCombo').getSelectedKey();
            var NoOftrucks = this.getView().getModel('selectedItem').getData().NoOfTrucks;
            // var oMaterial = this.byId("id_Material").getValue();
            // var oMaterial = this.oMaterial
            var oMaterial = "";
            var oTotalMonthlyQuantity = this.byId("id_monthFilter").getValue();
            var oPayload = {
                "Plant": oPlant,
                "Month": sMonth,
                "Year": sYear,
                "Material": oMaterial,
                "Mquan": oTotalMonthlyQuantity,
                "Quantity": String(oModel.Quantity),
                "UOM": oModel.UOM,
                "NoOfTrucks": NoOftrucks,
                "QtyPer": String(oModel.QtyPer),
                "Qtyperflag": oModel.Qtyperflag,
                "TransporterAllocWeeklySet": TransportModel,
                "TransporterAllocMonthlySet": [],
                "MessageSet": []
            }
            var oThat = this
            var oDataModel = this.getOwnerComponent().getModel();
            oDataModel.create('/HeaderSet', oPayload, {
                success: function (oData) {
                    // oThat.BusyDialog.close();
                    // MessageBox.success(oData.MessageSet.results[0].MESSAGE);
                    // oThat._showUpMessages(oData);
                    //  if(oEvent === "Delete"){
                    //     oThat._showUpMessages(oData);
                    //      allocationModel.splice(parseInt(sPath.split("/")[1]), 1); // remove from array
                    //     allocationModel.refresh(true);
                    //oSelectedObject

                    //     //sFlag = "X"
                    //  }
                    //   else{
                    oBusyDialog.close();
                    // oThat._showUpMessages(oData);
                    if (oData.MessageSet.results[0].TYPE === "S") {
                        MessageBox.success("The Material No:" + " " + oData.Material + " " + oData.MessageSet.results[0].MESSAGE);
                        oThat._oTransporterDialog.close();
                        // oThat.onGo();
                        oThat.byId("idPlanTable").getBinding("items").getModel("TableModel").getProperty(oThat.vSelectedRowSPath).Status = "Proposed";
                        oThat.getView().getModel("TableModel").refresh(true);
                        oThat.getView().getModel("TableModel").updateBindings(true);
                    } else {
                        var vMsg = "";
                        if (oData.MessageSet?.results?.length) {
                            oData.MessageSet.results.forEach(msg => {
                                vMsg += msg.MESSAGE + "\n";
                            })
                        }
                        // MessageBox.error("The Material No:" + " " + oData.Material + " " + oData.MessageSet.results[0].MESSAGE);
                        MessageBox.error(vMsg ? vMsg : oThat._oBundle.getText("WeekQuantityError"));
                    }
                    //  oThat.onGo();
                    // oThat._oTransporterDialog.close();
                    //   }
                    var ototalQty = 0;
                    var ototalPer = 0;
                    if (oData.TransporterAllocWeeklySet.results.length > 0) {
                        for (var i = 0; i < oData.TransporterAllocWeeklySet.results.length; i++) {
                            if (oData.Qtyperflag === "Q") {
                                ototalQty = Number(ototalQty) + Number(oData.TransporterAllocWeeklySet.results[i].Quantity);
                            } else {
                                ototalQty = Number(ototalQty) + Number(oData.TransporterAllocWeeklySet.results[i].QtyPer);
                            }
                        }
                    }
                    // if(oThat.byId('id_PageTitle').getText() === "Create"){
                    //     if(Number(ototalQty) === Number(oData.Mquan)){
                    //          oThat.byId("id_PageTitle").setText("Change");
                    //         oThat.byId('idSegmentedButton').setSelectedKey("CHANGE");
                    //         oThat.byId('id_PageTitle').setText("Change");
                    //         oThat.byId('id_MonthQunaty1').setVisible(true);
                    //         oThat.byId('id_month').setVisible(true);
                    //         oThat.byId("id_MonthlyFilter").setVisible(false);
                    //         oThat.byId("id_FilterYear").setVisible(false);
                    //         oThat.byId("id_FilterUOM").setVisible(false);
                    //         oThat.byId("id_FilterYear").setVisible(true);
                    //         oThat.byId("id_FilterPlant").setVisible(true);
                    //         oThat.byId("id_FilterMaterial").setVisible(true);
                    //         oThat.byId('id_SubmitBtn').setVisible(true);
                    //         oThat.byId('id_ApproveBtn').setVisible(false);
                    //         oThat.byId('id_RejectBtn').setVisible(false);
                    //         oThat.byId("id_FilterMonth").setVisible(true);
                    //         oThat.byId("id_FilterUOM").setVisible(true);
                    //         oThat.byId("id_Plant").setValue('');
                    //         oThat.byId("id_Material").setValue('');
                    //         oThat.byId("inp_uom").setValue('');
                    //         oThat.byId("id_monthFilter").setValue('');
                    //         oThat.byId("id_SlectedKey").setKey();
                    //         oThat.getView().getModel('TableModel').setData();
                    //         oThat.getView().getModel('TableModel').refresh();
                    //         oThat.getView().getModel('VISI').getData().table = true;
                    //         oThat.getView().getModel('VISI').getData().FilterItem = true;
                    //         oThat.getView().getModel('VISI').getData().treetable = false;
                    //         oThat.getView().getModel('VISI').getData().FormDisp = false;
                    //         oThat.getView().getModel('VISI').refresh(true);
                    //         oThat.getView().getModel("TableModel").setProperty("/", []);
                    //         this.byId('id_SubmitBtn').setVisible(false);
                    //         this.byId('id_CancelBtn').setVisible(false);
                    //         MessageBox.information("No Monthly Quantity has been Available for...\n\nSelected Plant:"+oData.Plant+" "+ "Material:"+oData.Material+" "+"Month & Year"+" "+oData.Month+"-"+oData.Year+"\n\nSo Navigating to Edit Page,"+" "+"Please Modify here if You Want...");

                    //     }else{
                    //     oThat.onGo();
                    //     }
                    // }else{
                    //     oThat.onGo();
                    // }

                    // oThat.onGo();
                    //oThat._oTransporterDialog.close();


                },
                error: function (oError) {
                    // debugger
                    // oThat.BusyDialog.close();
                    oBusyDialog.close();
                    MessageBox.error(oError.responseText);

                }
            })
        },

        //Delete Dialog
        onDeleteRow: function (oEvent) {
            //var oDeleteText = "Delete"
            // var oTable = this.byId("myTable");
            // var oItem = oEvent.getSource().getParent(); // Get the row
            // var iIndex = oTable.indexOfItem(oItem); // Get row index
            var scontext = oEvent.getSource().getBindingContext("TransportModel");
            // var sPath = scontext.getPath();
            var oSelectedObject = scontext.getObject();
            var sPath = scontext.getPath();
            var oHeadoModel = this.getView().getModel('selectedItem').getData();
            var oTransporterModel = this.getView().getModel('TransportModel');
            var allocationData = oTransporterModel.getData();
            if (!oSelectedObject.Transporter || !oSelectedObject.Percentage || !oSelectedObject.Quantity) {
                allocationData.splice(parseInt(sPath.split("/")[1]), 1); // remove from array
                oTransporterModel.setProperty("/", allocationData)
            } else {

                oSelectedObject.Deletion = "X";
                //oThat.onSave(oDeleteText, sPath);

                //  var WeekEdate = this.getView().byId("id_weekEDate").getValue();
                //  var WeekSdate = this.getView().byId("id_weekSDate").getValue();

                var TransportModel = [];
                TransportModel.push({
                    "Plant": oSelectedObject.Plant,
                    "Month": oSelectedObject.Month,
                    "WeekSdate": oSelectedObject.WeekSdate,
                    "WeekEdate": oSelectedObject.WeekEdate,
                    "Year": oSelectedObject.Year,
                    "WeekNo": oSelectedObject.WeekNo,
                    "Transporter": oSelectedObject.Transporter,
                    "TransporterName": oSelectedObject.TransporterName,
                    "Ranking": oSelectedObject.Ranking,
                    "Material": oSelectedObject.Material,
                    //"Quantity": oSelectedObject.Quantity+"."+"00",
                    "Percentage": String(oSelectedObject.Percentage),
                    "Quantity": String(oSelectedObject.Quantity),
                    "AvailableTrucks": oSelectedObject.AvailableTrucks,
                    "Volume": oSelectedObject.Volume,
                    "NoOfTrucks": oSelectedObject.NoOfTrucks,
                    "Deletion": oSelectedObject.Deletion
                })
                //     for (var i = 0; i < allocationData.length; i++) {
                //         TransportModel.push({
                //             "Plant": allocationData[i].Plant,
                //             "Month": allocationData[i].Month,
                //             "WeekSdate": allocationData[i].WeekSdate,
                //             "WeekEdate": allocationData[i].WeekEdate,
                //             "Year": allocationData[i].Year,
                //             "WeekNo": allocationData[i].WeekNo,
                //             "Transporter": allocationData[i].Transporter,
                //             "TransporterName": allocationData[i].TransporterName,
                //             "Ranking": allocationData[i].Ranking,
                //             "Material": allocationData[i].Material,
                //             //"Quantity": allocationData[i].Quantity+"."+"00",
                //             "Percentage": String(allocationData[i].Percentage),
                //             "Quantity": String(allocationData[i].Quantity),
                //             "AvailableTrucks": allocationData[i].AvailableTrucks,
                //             "Volume": allocationData[i].Volume,
                //             "NoOfTrucks": allocationData[i].NoOfTrucks,
                //             "Deletion" :  allocationData[i].Deletion
                //         })
                // //        if(oEvent === "Delete"){
                // //     //sFlag = "X"
                // //    }
                //     }
                // TransporterAllocWeeklySet.push(TransportModel);
                // var oPlant = this.oPlant;
                // var sYear = this.getView().byId('idYearPicker').getValue();
                // var sMonth = this.getView().byId('id_MonthCombo').getSelectedKey();
                // var NoOftrucks = this.getView().getModel('selectedItem').getData().NoOfTrucks;
                // var oMaterial = this.byId("id_Material").getValue();
                var oPayload = {

                    "Plant": oHeadoModel.Plant,
                    "Month": oHeadoModel.Month,
                    "Year": oHeadoModel.Year,
                    "Material": oHeadoModel.Material,
                    "Quantity": String(oHeadoModel.Quantity),
                    "UOM": oHeadoModel.UOM,
                    "NoOfTrucks": oHeadoModel.NoOfTrucks,
                    "TransporterAllocWeeklySet": TransportModel,
                    "TransporterAllocMonthlySet": [],
                    "MessageSet": []

                }
                var oThat = this

                var oDataModel = this.getOwnerComponent().getModel();
                oDataModel.create('/HeaderSet', oPayload, {
                    success: function (oData, oResponse) {
                        // oThat.BusyDialog.close();
                        // MessageBox.success(oData.MessageSet.results[0].MESSAGE);
                        // oThat._showUpMessages(oData);
                        //  if(oEvent === "Delete"){

                        allocationData.splice(parseInt(sPath.split("/")[1]), 1); // remove from array
                        oTransporterModel.setProperty("/", allocationData)
                        oThat._showUpMessages(oData);
                        //oSelectedObject

                        //     //sFlag = "X"
                        //  }
                        //   else{
                        //   oThat._showUpMessages(oData);
                        // oThat.onGo();
                        //    oThat._oTransporterDialog.close();
                        //   }
                        // oThat.onGo();
                        //oThat._oTransporterDialog.close();


                    },
                    error: function (oError) {
                        // debugger
                        // oThat.BusyDialog.close();
                        MessageBox.error(oError.responseText);

                    }
                })
            }

        },

        onDeleteRow1: function (sPath) {
            // Get model
            var oModel = this.getView().getModel('TransportModel');
            // Get binding path of the clicked row
            //var sPath = oEvent.getSource().getBindingContext("TransportModel").getPath();
            // Get row data
            var oRowData = oModel.getProperty(sPath);
            // Mark deletion flag
            oRowData.Deletion = "X";
            // oRowData.Visible = false;
            // Update back to model
            oModel.setProperty(sPath, oRowData);
            // (Optional) remove from visible table if you don't want to show after deletion
            // get array
            var aRows = oModel.getProperty("/");

        },


        // on Execute for Report / display screen
        onExecute: function () {
            oThat.BusyDialog.open();
            var that = this;
            var oView = this.getView();
            var isApprovalPage = this.byId("idSegmentedButton").getSelectedButton().includes("idSegBtnA");
            var access = oThat._access || {};
            var approveAccess = (access.ApproveScreen === "X");
            var oApproveBtn = oView.byId("id_ApproveBtn");
            oApproveBtn.setVisible(approveAccess);
            var oRejectBtn = oView.byId("id_RejectBtn");
            oRejectBtn.setVisible(approveAccess);
            // var oVBox = sap.ui.getCore().byId("idMonthBox");
            // var oParent = oVBox?.getParent();
            // if (oParent) {
            //     oParent.removeItem(oVBox); 
            // }
            var oVBox = oView.byId("weekContainer");
            oVBox.removeAllItems();
            var oContainer = this.byId("monthPanelContainer");
            oContainer.removeAllItems();
            var oFilterPPID = this.getView().byId("id_MonthCombo1");
            var oFilterYearID = this.getView().byId("idYearPicker1");
            var oFilterPlantID = this.getView().byId("id_Plant1");
            // var oFilterMaterialID = this.getView().byId("id_Material1");
            var oFilterPP = oFilterPPID.getSelectedItems();
            // var oFilterPP1 = oFilterPP.getKey();
            var oFilterYear = oFilterYearID.getValue();
            var oFilterPlant = oFilterPlantID.getValue();
            // var oFilterMaterial = oFilterMaterialID.getValue();
            // var oFilterMaterial = this.oMaterial
            var oFilterMaterial = "";
            var goFilters = [
                new Filter("Plant", FilterOperator.EQ, oFilterPlant),
                new Filter("Material", FilterOperator.EQ, oFilterMaterial),
                new Filter("Year", FilterOperator.EQ, oFilterYear),
                new Filter("Flag", FilterOperator.EQ, "D")

            ];
            // var sortItems = oFilterPP.map(item => item.getKey());
            oFilterPP.forEach(item => {
                goFilters.push(new Filter("Month", FilterOperator.EQ, item.getKey()));
            })
            // Validate inputs
            if (isApprovalPage) {
                return;
            }
            if (!oFilterPlant || !oFilterPP || !oFilterYear) {
                MessageToast.show("Please enter all required filters.");
                oThat.BusyDialog.close();
                return;
            }
            this.WeekListData = [];
            var oDataModel = this.getOwnerComponent().getModel();
            oDataModel.read("/HeaderSet", {
                filters: goFilters,
                urlParameters: {
                    $expand: "TransporterAllocMonthlySet,TransporterAllocWeeklySet,MessageSet"
                },
                success: function (oData, oResponse,) {
                    if (oData.results.length >= 1) {
                        oData.results.sort((a, b) => +(a.Month) - +(b.Month));
                        var oClonedData = JSON.parse(JSON.stringify(oData.results));
                        var oOriginalWeekModel = new JSONModel(oClonedData);
                        that.getView().setModel(oOriginalWeekModel, "oOriginalWeekModel");
                        var aResults = oData.results;
                        if (aResults[0].MessageSet.results.length > 0) {
                            oThat.BusyDialog.close();
                            MessageBox.error(aResults[0].MessageSet.results[0].MESSAGE)
                        } else {

                            var bHasData = aResults.length > 0 && aResults[0].TransporterAllocWeeklySet.results.length > 0;
                            var sApprejbut = aResults[0].Apprejbut;
                            [oApproveBtn, oRejectBtn].forEach(function (btn) {
                                if (btn && btn.getVisible()) {
                                    var bVisible = (sApprejbut === "Y") && bHasData;
                                    btn.setVisible(bVisible);
                                }
                            });
                            if (!bHasData) {
                                MessageToast.show(that._oBundle.getText("NoDataAvailable"));
                                oVBox.removeAllItems();
                                oThat.BusyDialog.close();
                                return;
                            }
                            var groupedMonthData = {};
                            oData.results.forEach(function (item) {
                                var groupedData = {};
                                // oContainer.removeAllItems();
                                let vMonth = +(item.Month);
                                let monthKey = oThat.getView().getModel("oMonthsModel").getData().months[vMonth - 1].name;
                                if (!groupedMonthData[monthKey]) {
                                    groupedMonthData[monthKey] = [];
                                }
                                groupedMonthData[monthKey].push(item);
                                item.TransporterAllocWeeklySet.results.forEach(function (item) {
                                    var weekKey = "WeekNo " + item.WeekNo;
                                    if (!groupedData[weekKey]) {
                                        groupedData[weekKey] = [];
                                    }
                                    groupedData[weekKey].push(item);
                                });
                                groupedMonthData[monthKey][0].TransporterAllocWeeklySet.results = groupedData;
                                // Object.keys(groupedMonthData).forEach(monthName => {
                                var monthEntries = groupedMonthData[monthKey];
                                monthEntries.forEach(monthData => {
                                    var oWeekVBox = new sap.m.VBox();
                                    Object.keys(monthData.TransporterAllocWeeklySet.results).forEach(weekKey => {
                                        var weekItems = monthData.TransporterAllocWeeklySet.results[weekKey];
                                        var oTable = new sap.ui.table.Table({
                                            // title: "Weekly Plan",
                                            // visibleRowCount: 10,
                                            selectionMode: "None",
                                            columns: [
                                                new sap.ui.table.Column({
                                                    label: new sap.m.Label({ text: "Week", wrapping: true }),
                                                    template: new sap.m.Text({ text: "{WeekNo}" }),
                                                    width: "60px",
                                                    sortProperty: "WeekNo"
                                                }),
                                                // new sap.ui.table.Column({
                                                //     label: new sap.m.Label({ text: "Date Range" }),
                                                //     template: new sap.m.Text({ text: "{WeekSdate} - {WeekEdate}" }),
                                                //     width: "100px",
                                                //     sortProperty: "WeekSdate"
                                                // }),
                                                new sap.ui.table.Column({
                                                    label: new sap.m.Label({ text: "Start Date", wrapping: true }),
                                                    template: new sap.m.Text({ text: "{WeekSdate}" }),
                                                    width: "100px",
                                                    sortProperty: "WeekSdate"
                                                }), new sap.ui.table.Column({
                                                    label: new sap.m.Label({ text: "End Date", wrapping: true }),
                                                    template: new sap.m.Text({ text: "{WeekEdate}" }),
                                                    width: "100px",
                                                    sortProperty: "WeekSdate"
                                                }),
                                                new sap.ui.table.Column({
                                                    label: new sap.m.Label({ text: "Transporter", wrapping: true }),
                                                    template: new sap.m.Text({ text: "{Transporter} - {TransporterName}" }),
                                                    // width: "250px",
                                                    sortProperty: "Transporter"
                                                }),
                                                // new sap.ui.table.Column({
                                                //     label: new sap.m.Label({ text: "Material", wrapping: true }),
                                                //     template: new sap.m.Text({ text: "{Material}" }),
                                                //     width: "111px",
                                                //     sortProperty: "Material"
                                                // }),
                                                // new sap.ui.table.Column({
                                                //     label: new sap.m.Label({ text: "Material Description", wrapping: true }),
                                                //     template: new sap.m.Text({ text: "{MaterialText}" }),
                                                //     width: "342px",
                                                //     sortProperty: "MaterialText"
                                                // }),
                                                new sap.ui.table.Column({
                                                    label: new sap.m.Label({ text: "Quantity", wrapping: true }),
                                                    template: new sap.m.Text({ text: "{Quantity}" }),
                                                    width: "80px",
                                                    sortProperty: "Quantity"
                                                }),
                                                new sap.ui.table.Column({
                                                    label: new sap.m.Label({ text: "UOM", wrapping: true }),
                                                    template: new sap.m.Text({ text: "{Uom}" }),
                                                    width: "60px",
                                                    sortProperty: "Uom"
                                                }),
                                                new sap.ui.table.Column({
                                                    label: new sap.m.Label({ text: "Truck Required", wrapping: true }),
                                                    template: new sap.m.Text({ text: "{NoOfTrucks}" }),
                                                    width: "150px",
                                                    sortProperty: "NoOfTrucks"
                                                }),
                                                new sap.ui.table.Column({
                                                    label: new sap.m.Label({ text: "Status", wrapping: true }),
                                                    template: new sap.m.Text({ text: "{Status}" }),
                                                    width: "200px",
                                                    sortProperty: "Status"
                                                })
                                            ]
                                        });
                                        oTable.setRowSettingsTemplate(new sap.ui.table.RowSettings({
                                            highlight: "{= ${Status} === 'Sent for Transporter Approval' ? 'Warning' : (${Status} === 'Transporter-Rejected' ? 'Error' : (${Status} === 'Transporter-Approved' ? 'Success' : (${Status} === 'Revised' ? 'Information' : 'None'))) }"
                                            // highlight: "{= ${Status} === 'Awaiting Internal Approval' ? 'Warning' : (${Status} === 'Transporter-Rejected' ? 'Error' : (${Status} === 'Transporter-Approved' ? 'Success' : 'None')) }"
                                        }));

                                        var oModel = new sap.ui.model.json.JSONModel({ data: weekItems });
                                        that.getView().setModel(oModel, "WeekModel");
                                        var rowCount = weekItems.length;
                                        oTable.setVisibleRowCount(rowCount);
                                        oTable.setModel(oModel);
                                        oTable.bindRows("/data");
                                        var oWeekPanel = new sap.m.Panel({
                                            headerText: weekKey,
                                            expandable: true,
                                            expanded: true,
                                            content: [oTable]
                                        });
                                        oWeekVBox.addItem(oWeekPanel);
                                    })

                                    // var oMonthControl = new sap.m.Label({
                                    //     text: "Month:",
                                    //     design: "Bold"
                                    // });
                                    // var oMaterialControl = new sap.m.Label({
                                    //     text: "Material No:",
                                    //     design: "Bold"
                                    // });
                                    var oTotalQuantityControl = new sap.m.Label({
                                        text: "Total Monthly Quantity:",
                                        design: "Bold"
                                    });
                                    var oStatusControl = new sap.m.Label({
                                        text: "Loading...",
                                        design: "Bold"
                                    });
                                    var oToolbar = new sap.m.Toolbar({
                                        content: [
                                            new sap.m.Title({
                                                text: "Serial No: " + monthData.Serialno,
                                                level: "H2"
                                            }),
                                            new sap.m.ToolbarSpacer(),
                                            // oMonthControl,
                                            // new sap.m.ToolbarSeparator(),
                                            new sap.m.Label({
                                                text: "Plant: " + monthData.Plant,
                                                design: "Bold"
                                            }),
                                            // new sap.m.ToolbarSeparator(),
                                            // oMaterialControl,
                                            new sap.m.ToolbarSeparator(),
                                            oTotalQuantityControl,
                                            new sap.m.ToolbarSeparator(),
                                            oStatusControl,
                                            new sap.m.ToolbarSpacer(),
                                            new sap.m.Button({
                                                text: "Download",
                                                icon: "sap-icon://download",
                                                press: function () {
                                                    var oMonthData = that.getView().getModel("oOriginalWeekModel").getData();
                                                    for (let i = 0; i < oMonthData.length; i++) {
                                                        if (monthData.Month === oMonthData[i].Month) {
                                                            that.onDownloadExcel(oMonthData[i]);
                                                        }
                                                    }
                                                }
                                            })
                                        ]
                                    });
                                    // var sMaterial = monthData.Material;
                                    var sMonthlyTotalQuantity = monthData.Mquan;
                                    var sStatus = monthData.Status;
                                    var vMonth = monthKey;
                                    // oMonthControl.setText("Month: " + vMonth);
                                    // oMaterialControl.setText("Material: " + sMaterial);
                                    oTotalQuantityControl.setText("Total Monthly Quantity: " + sMonthlyTotalQuantity);
                                    // var vMaterialText = monthData.TransporterAllocWeeklySet.results.map(item => {
                                    //     item.map(subitem => {
                                    //         if (subitem.Material === sMaterial) {
                                    //             return subitem.MaterialText;
                                    //         }
                                    //     })

                                    // });
                                    // oMaterialControl.setTooltip(monthData.vMaterialText);
                                    oStatusControl.setText("Status: " + sStatus);
                                    that.byId("id_monthFilter").setValue(sMonthlyTotalQuantity);
                                    var oMonthPanel = new sap.m.Panel({
                                        headerText: monthKey + " (" + monthData.Year + ")",
                                        expandable: true,
                                        expanded: false,
                                        content: [
                                            oToolbar,
                                            oWeekVBox
                                        ]
                                    });
                                    oMonthPanel.addStyleClass("MonthPanelCss");
                                    oContainer.addItem(oMonthPanel);
                                });
                                // });
                            })

                            that.BusyDialog.close();
                        }
                    } else {
                        MessageToast.show(that._oBundle.getText("NoDataAvailable"));
                        oThat.BusyDialog.close();
                    }
                }.bind(this),
                error: function (oError) {
                    oView.byId("id_ApproveBtn").setVisible(false);
                    oView.byId("id_RejectBtn").setVisible(false);
                    oThat.BusyDialog.close();
                    MessageBox.error(oError.responseText);
                },
            });
        },


        //Accept , Reject
        onActionPress: function (oEvent) {
            var isApprovalPage = this.byId("idSegmentedButton").getSelectedButton().includes("idSegBtnA");
            var sAction = oEvent.getSource().getText(); // "Approve" or "Reject"
            var sFlag = (sAction === "Approve") ? "A" : "R"; // You can map this based on constants if needed
            var sButtonState = (sAction === "Approve") ? "Accept" : "Reject";
            // if (!this._oBasePayload) {
            //     sap.m.MessageBox.error("No base data found for submission.");
            //     return;
            // }

            oEvent.getSource().getText();
            var oTableModel = this.getView().getModel("TreeModel").getData(); // your table
            var oTransporterData = this.getView().getModel("TransportModel").getData(); // transporter allocations
            var oPlant = this.oPlant;
            var sYear = this.getView().byId('idYearPicker').getValue();
            var sMonth = this.getView().byId('id_MonthCombo').getSelectedKey();
            // var oMaterial = this.byId("id_Material").getValue();
            var sUom = this.byId("inp_uom").getValue();
            var MonthlyQty = this.byId("id_monthFilter").getValue();
            if (isApprovalPage) {
                oTableModel = this.ApprovalPageSelectedItem;
            }
            //  var aProcessedHeaders = [];
            var aProcessedItems = [];
            oTableModel.forEach(function (oHeader) {
                // Push header WITHOUT HeaderToItemNav
                //    aProcessedHeaders.push({
                //                 WeekNo : oHeader.WeekNo,
                //                 WeekSdate: oHeader.WeekSdate,
                //                 WeekEdate: oHeader.WeekEdate,
                //                 Quantity : oHeader.Quantity,
                //                 NoOfTrucks : oHeader.NoOfTrucks

                //    });
                // Push each item from HeaderToItemNav
                (oHeader.TransporterAllocWeeklySet.results || []).forEach(function (oItem) {
                    aProcessedItems.push({
                        Plant: oItem.Plant,
                        Month: oItem.Month,
                        Year: oItem.Year,
                        WeekNo: oItem.WeekNo,
                        Transporter: oItem.Transporter,
                        TransporterName: oItem.TransporterName,
                        Ranking: oItem.Ranking,
                        Material: oItem.Material,
                        WeekSdate: oItem.WeekSdate,
                        WeekEdate: oItem.WeekEdate,
                        Quantity: oItem.Quantity,
                        Uom: oItem.Uom,
                        AvailableTrucks: oItem.AvailableTrucks,
                        Volume: oItem.Volume,
                        NoOfTrucks: oItem.NoOfTrucks,
                    });
                });
            });



            oThat.oBasePayload = {
                Plant: oTableModel[0].Plant,
                Month: oTableModel[0].Month,
                Year: oTableModel[0].Year,
                Material: oTableModel[0].Material,
                UOM: oTableModel[0].UOM,
                NoOfTrucks: oTableModel[0].NoOfTrucks,
                // Flag: "A",
                // RejReason: oTableModel[0].RejReason,
                TransporterAllocWeeklySet: aProcessedItems,
                // HeaderToItemNav: aProcessedItems,
                TransporterAllocMonthlySet: [],
                MessageSet: []

            };
            var oDialog;
            var oTextArea;
            if (sAction === "Reject") {
                oTextArea = new sap.m.TextArea({
                    width: "100%",
                    rows: 4,
                    placeholder: "Enter reason...",
                    liveChange: function (oEvt) {
                        var sValue = oEvt.getParameter("value");
                        var oBeginButton = oDialog.getBeginButton();
                        oBeginButton.setEnabled(!!sValue.trim());
                    }

                });
                // var sEnabled = true;
                // var sReason = oTextArea.getValue().trim();
            }
            // else{
            //    // oTextArea = "";
            //    // var sReason = oTextArea.getValue().trim();
            //     var sReason = ""
            //     var sEnabled = true;
            // }

            //  var that = this;
            oDialog = new sap.m.Dialog({
                title: sAction + " Confirmation",
                // title:  "Messages",
                contentWidth: "500px",
                type: "Message",
                content: [
                    new sap.m.Text({
                        text: "Are you sure you want to " + sAction.toLowerCase() + "?"
                    }),
                    oTextArea
                ],
                beginButton: new sap.m.Button({
                    text: sAction,
                    // enabled: false,
                    // enabled: sEnabled,
                    enabled: (sAction === "Approve"),
                    type: sButtonState,
                    press: function () {
                        var sReason = (sAction === "Reject" && oTextArea) ? oTextArea.getValue().trim() : "";
                        // var sReason = oTextArea.getValue().trim();
                        // Create a copy of the existing payload and add reason + flag
                        var oPayload = Object.assign({}, oThat.oBasePayload, {
                            Flag: sFlag,
                            RejReason: sReason
                        });
                        oThat.BusyDialog.open();
                        oThat._submitToOData(oPayload);
                        oDialog.close();
                    }
                }),
                endButton: new sap.m.Button({
                    text: "Cancel",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();
        },
        // odata call for approve and reject
        _submitToOData: function (oPayload) {
            var oModel = oThat.getView().getModel(); // your default OData model
            oModel.create("/HeaderSet", oPayload, {
                success: function (oData, oResponse) {
                    // sap.m.MessageToast.show("Submission successful.");

                    oThat.onExecute();
                    oThat.BusyDialog.close();
                    oThat._showUpMessages(oData);
                    oThat.onFetchWeeklyReport();
                },
                error: function (oError) {
                    oThat.BusyDialog.close();
                    MessageBox.error(oError.responseText);
                    oThat.onFetchWeeklyReport();

                }
            });
        },


        // Create Screen Submit
        onSubmit: function (oEvent) {
            var vTotMonthlyQunatity = this.byId("id_monthFilter").getValue();
            var vRemMonthlyQunatity = this.byId("id_month").getText();
            if (!vTotMonthlyQunatity || vTotMonthlyQunatity === "0") {
                MessageBox.error(this._oBundle.getText("TotMonthlyQuantError"));
                return;
            } else if (vRemMonthlyQunatity && vRemMonthlyQunatity !== "0") {
                MessageBox.error(this._oBundle.getText("TotWeeklyDataError"));
                return;
            }
            sap.m.MessageBox.confirm(this._oBundle.getText("submitConfirmation"), {
                title: "Confirmation",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        var oTableModel = oThat.getView().getModel("TableModel").getData(); // your table
                        if (!oTableModel || Object.keys(oTableModel).length === 0) {
                            return; // if no data return
                        }
                        oThat.BusyDialog.open();
                        //   var oTransporterData = oThat.getView().getModel("TransportModel").getData(); // transporter allocations
                        var oPlant = oThat.oPlant;
                        var sYear = oThat.getView().byId('idYearPicker').getValue();
                        var sMonth = oThat.getView().byId('id_MonthCombo').getSelectedKey();
                        // var oMaterial = oThat.byId("id_Material").getValue();
                        // var oMaterial = oThat.oMaterial;
                        var oMaterial = "";
                        var sUom = oThat.byId("inp_uom").getValue();
                        var MonthlyQty = oThat.byId("id_monthFilter").getValue();
                        var aProcessedHeaders = [];
                        var aProcessedItems = [];
                        oTableModel.forEach(function (oHeader) {
                            // Push header WITHOUT HeaderToItemNav
                            aProcessedHeaders.push({
                                WeekNo: oHeader.WeekNo,
                                WeekSdate: oHeader.WeekSdate,
                                WeekEdate: oHeader.WeekEdate,
                                Quantity: String(oHeader.Quantity),
                                NoOfTrucks: oHeader.NoOfTrucks,
                                QtyPer: String(oHeader.QtyPer)
                                // Qtyperflag: oHeader.Qtyperflag

                            });
                            // Push each item from HeaderToItemNav
                            (oHeader.HeaderToItemNav.results || []).forEach(function (oItem) {
                                aProcessedItems.push({
                                    Plant: oItem.Plant,
                                    Month: oItem.Month,
                                    Year: oItem.Year,
                                    WeekNo: oItem.WeekNo,
                                    Transporter: oItem.Transporter,
                                    TransporterName: oItem.TransporterName,
                                    Ranking: oItem.Ranking,
                                    Material: oItem.Material,
                                    WeekSdate: oItem.WeekSdate,
                                    WeekEdate: oItem.WeekEdate,
                                    Quantity: String(oItem.Quantity),
                                    Uom: oItem.Uom,
                                    AvailableTrucks: oItem.AvailableTrucks,
                                    Volume: oItem.Volume,
                                    NoOfTrucks: oItem.NoOfTrucks,
                                });
                            });
                        });



                        var oPayload = {
                            Year: sYear,
                            Plant: oPlant,
                            Material: oMaterial,
                            Month: sMonth,
                            UOM: sUom,
                            Submit: "X",
                            Mquan: MonthlyQty,
                            TransporterAllocWeeklySet: aProcessedHeaders,
                            HeaderToItemNav: aProcessedItems,
                            MessageSet: []
                        };

                        // call your OData create/submit
                        var oDataModel = oThat.getOwnerComponent().getModel();
                        oDataModel.create("/HeaderSet", oPayload, {
                            success: function (oData, oResponse) {
                                oThat.BusyDialog.close();
                                if (oData.MessageSet.results[0].TYPE === "S") {
                                    oThat.onClearFilters();
                                }
                                oThat._showUpMessages(oData);
                                // MessageBox.success(oData.MessageSet.results[0].MESSAGE)
                            },
                            error: function (oError) {
                                oThat.BusyDialog.close();
                                oThat.BusyDialog.close();
                                MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                                //MessageBox.error(oError.responseText);
                                // MessageBox.error(JSON.parse(oError.responseText).error.message.value + "\n\n Please Maintain the Quantities..");
                            }
                        });
                    } else {
                        return;
                    }
                }
            });
        },

        //***********************************************End of Actions***************************** */

        // **********************************************Reuse Functions*********************
        // Messges Dialog/Popup
        _showUpMessages: function (oData) {
            var oThat = this;
            const aMessages = oData.MessageSet.results || [];
            if (!aMessages.length) {
                // MessageToast.show("No messages returned.");
                //  MessageToast.show(oThat.getI18nText("NoMessagesReturned"));
                return;
            }
            // Build message display items
            const aMessageItems = aMessages.map((msg) => {
                const sType = msg.TYPE;
                const sText = msg.MESSAGE || "Unknown message";
                const sIcon = sType === "S" ? "sap-icon://message-success" :
                    sType === "W" ? "sap-icon://message-warning" :
                        "sap-icon://message-error";
                const sColor = sType === "S" ? "Positive" :
                    sType === "W" ? "Critical" :
                        "Negative";
                return new sap.m.HBox({
                    alignItems: "Center",
                    items: [
                        new sap.ui.core.Icon({
                            src: sIcon,
                            color: sColor,
                            size: "1.5rem"
                        }),
                        new sap.m.Text({
                            text: sText,
                            wrapping: true
                        }).addStyleClass("sapUiTinyMarginBegin")
                    ]
                });
            });
            // Build and open dialog
            const oDialog = new sap.m.Dialog({
                title: "Messages",
                contentWidth: "500px",
                type: "Message",
                content: new sap.m.VBox({
                    items: aMessageItems
                }),
                beginButton: new sap.m.Button({
                    text: "OK",
                    type: "Default",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });
            oDialog.open();

        },

        // sumof trucks caluclate
        _sumNoOfTrucks: function (sData, fTruckReq) {

            var oTable = this.byId("myTable"); // Replace with your table ID
            var aItems = oTable.getRows();
            var iTotal = 0;

            aItems.forEach(function (oItem) {
                var oCells = oItem.getCells();
                var sValue = oCells[8].getValue(); // Assuming column 1 is 'nooftrucks' and uses Input
                var iValue = parseInt(sValue, 10);
                if (!isNaN(iValue)) {
                    iTotal += iValue;
                }
            });

            console.log("Total No of Trucks:", iTotal);
            return iTotal;
        },

        // end of messages 
        //**********************************************End Of Reuse Functions ***********************/

        //**********************************************Excel Download***************************** */
        onDownloadExcel: function (monthData) {

            // get your data model (assuming JSONModel with week data)

            var aModel = monthData?.Serialno ? monthData : this.ApprovalPageSelectedItem[0];
            var aData = aModel?.TransporterAllocWeeklySet?.results;
            if (!aData || !aData.length) {
                MessageToast.show(this._oBundle.getText("NoDataToDownload"));
                return;
            }
            if(this.oSegmentBtn.getSelectedKey() === "Approval" && !this.byId("idDetailStatus").getText() && !this.byId("idDetailMonth").getText() && !this.byId("idDetailTotQuantity").getText()){
                MessageToast.show("Please Select the Main Item");
                return;
            }
            MessageBox.information(this._oBundle.getText("ExcelDownloadConf"), {
                title: "Information",
                styleClass: "sapUiSizeCompact",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === "YES") {
                        // var aFileName = aModel.Serialno + "_" + aModel.Plant + "_" + aModel.Material + "_" + aModel.Month + "_" + aModel.Year + ".xlsx";
                        var aFileName = aModel.Serialno + "_" + aModel.Plant + "_" + aModel.Month + "_" + aModel.Year + ".xlsx";
                        // var aData = oModel.getData(); // or aData = oModel.getProperty("/YourPath");
                        // build columns structure
                        var aCols = [{
                            label: "Serial No",
                            property: "Serialno"
                        },
                        {
                            label: "Week No",
                            property: "WeekNo"
                        },
                        {
                            label: "Week Start Date",
                            property: "WeekSdate"
                        },
                        {
                            label: "Week End Date",
                            property: "WeekEdate"
                        },
                        {
                            label: "Month",
                            property: "Month"
                        },
                        {
                            label: "Year",
                            property: "Year"
                        },
                        {
                            label: "Plant",
                            property: "Plant"
                        },
                        // {
                        //     label: "Material",
                        //     property: "Material"
                        // },
                        // {
                        //     label: "Material Description",
                        //     property: "MaterialText"
                        // },
                        {
                            label: "Quantity",
                            property: "Quantity"
                        },
                        {
                            label: "Uom",
                            property: "Uom"
                        },
                        {
                            label: "Transporter",
                            property: "Transporter"
                        },
                        {
                            label: "Transporter Description",
                            property: "TransporterName"
                        },
                        {
                            label: "Ranking",
                            property: "Ranking"
                        },
                        {
                            label: "Percentage",
                            property: "Percentage"
                        },
                        {
                            label: "No of Trucks",
                            property: "NoOfTrucks"
                        },
                        {
                            label: "Status",
                            property: "Status"
                        },
                        {
                            label: "Remarks",
                            property: "RejReason"
                        },
                        ];
                        // spreadsheet settings
                        var oSettings = {
                            workbook: {
                                columns: aCols,
                                context: {
                                    sheetName: aModel.Month + "_" + aModel.Year
                                }

                            },
                            dataSource: aData,
                            // fileName: "WeekData.xlsx"
                            fileName: aFileName

                        };
                        // create and build export
                        var oSheet = new sap.ui.export.Spreadsheet(oSettings);
                        oSheet.build().finally(function () {
                            oSheet.destroy();
                        });
                        oSpreadsheet.build().then(function () {
                            sap.m.MessageToast.show(this._oBundle.getText("ExcelDownloaded"));
                        });
                    }
                }.bind(this)
            });

        },

        onReportDownload: function () {
            var oTable = this.byId("yourTableId");
            var oModel = oTable.getModel();
            var aData = oModel.getProperty("/yourModelPath");
            if (!aData || !aData.length) {
                MessageToast.show(this._oBundle.getText("NoDataToDownload"));
                return;
            }
            MessageBox.information(this._oBundle.getText("ExcelDownloadConf"), {
                title: "Information",
                styleClass: "sapUiSizeCompact",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === "YES") {
                        var aFileName = aData.Serialno + "_" + aData.Plant + "_" + ".xlsx";
                        // var aData = oModel.getData(); // or aData = oModel.getProperty("/YourPath");
                        // build columns structure
                        var aCols = [
                            { label: "Plant", property: "Plant" },
                            { label: "Company Code", property: "CompanyCode" },
                            { label: "Serial Key", property: "SerialKey" },
                            { label: "Month", property: "Month" },
                            { label: "Year", property: "Year" },
                            { label: "Monthly Qty", property: "MonthlyQty" },
                            { label: "Week Number", property: "WeekNumber" },
                            { label: "Week Start - End", property: "WeekStartEnd" },
                            { label: "Week Quantity", property: "WeekQty" },
                            { label: "UOM", property: "UOM" },
                            { label: "Transporter Name", property: "TransporterName" },
                            { label: "Transporter Description", property: "TransporterDesc" },
                            { label: "No of Trucks Planned", property: "TrucksPlanned" },
                            { label: "Actual Trucks Fulfilled", property: "TrucksFulfilled" },
                            { label: "Versioning Serial No", property: "VersionSerialNo" },
                            { label: "Allocation Status", property: "AllocationStatus" },
                            { label: "Approval Date", property: "ApprovalDate" },
                            { label: "Approval Time", property: "ApprovalTime" },
                            { label: "Changed By", property: "ChangedBy" },
                            { label: "Changed On", property: "ChangedOn" },
                            { label: "Last Changed Time", property: "LastChangedTime" },
                            { label: "Remarks", property: "Remarks" }
                        ];
                        var oSpreadsheet = new sap.ui.export.Spreadsheet({
                            workbook: {
                                columns: aCols,
                                hierarchyLevel: 'Level'
                            },
                            dataSource: aData,
                            fileName: aFileName,
                            worker: false
                        });

                        oSpreadsheet.build().then(function () {
                            sap.m.MessageToast.show(this._oBundle.getText("ExcelDownloaded"));
                        });
                    }
                }.bind(this)
            });

        },
        // *********************************************End of Excel Download**************************    

        oMonthsValidation: function (sScreenName) {
            var oMonthModel = new JSONModel();
            var sPath = jQuery.sap.getModulePath("com.olam.zgtmmtruckalloc", "/model/months.json");
            oMonthModel.loadData(sPath);
            if (sScreenName === "CREATE" || sScreenName === "CHANGE") {
                oMonthModel.attachRequestCompleted(function () {
                    // console.log("first" + oMonthModel);
                    var curMonth = new Date().getMonth() + 1;
                    var iPrev = curMonth - 1;
                    var iNext = curMonth + 1;
                    for (var x in oMonthModel.oData.months) {
                        if (curMonth === parseInt(oMonthModel.oData.months[x].key)) {
                            oMonthModel.oData.months[x].menable = true;
                        }
                        if (iNext === parseInt(oMonthModel.oData.months[x].key)) {
                            oMonthModel.oData.months[x].menable = true;
                        }
                         // checking if curret date is less than or equal to 5th of month than hide the past month
                         if (new Date().getDate() <= 5) {
                            if (iPrev === parseInt(oMonthModel.oData.months[x].key)) {
                                oMonthModel.oData.months[x].menable = true;
                            }
                        } else {
                            if (iPrev === parseInt(oMonthModel.oData.months[x].key)) {
                                oMonthModel.oData.months[x].menable = false;
                            }
                        }

                        // if (iPrev === parseInt(oMonthModel.oData.months[x].key)) {
                        //     oMonthModel.oData.months[x].menable = true;
                        // }
                    }
                    this.getView().setModel(oMonthModel, "oMonthsModel");
                }.bind(this));
            } else if (sScreenName === "DISPLAY") {
                oMonthModel.attachRequestCompleted(function () {
                    console.log("first" + oMonthModel);
                    var curMonth = new Date().getMonth() + 1;
                    var iPrev = curMonth - 1;
                    var iNext = curMonth + 1;
                    for (let i = 0; i <= curMonth; i++) {
                        oMonthModel.oData.months[i].menable = true;
                    }
                    this.getView().setModel(oMonthModel, "oMonthsModel");
                }.bind(this));
            }
        },
        onCancelButtonPress: function (oEvent) {
            sap.m.MessageBox.confirm("Are you sure you want cancel the process", {
                title: "Information",
                icon: MessageBox.Icon.INFORMATION,
                actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === "YES") {
                        this.onClearFilters();
                        // var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                        // // Navigate back to Fiori Launchpad Home
                        // oCrossAppNavigator.toExternal({
                        //     target: {
                        //         shellHash: "#"
                        //     }
                        // });
                    }
                }.bind(this)
            });
        },


        getAppovalRecords: function () {
            var that = this;
            that.BusyDialog = new BusyDialog({
                text: this._oBundle.getText("BusyDialog")
            });
            that.BusyDialog.open();
            var oDataModel = this.getOwnerComponent().getModel();
            var goFilters = [
                new Filter("Plant", FilterOperator.EQ, "X"),
                new Filter("Material", FilterOperator.EQ, "X"),
                new Filter("Month", FilterOperator.EQ, "X"),
                new Filter("Year", FilterOperator.EQ, "X"),
                new Filter("Flag", FilterOperator.EQ, "A")
            ];
            oDataModel.read("/HeaderSet", {
                filters: goFilters,
                urlParameters: {
                    $expand: "TransporterAllocMonthlySet,TransporterAllocWeeklySet,MessageSet"
                },
                success: function (oData, oResponse,) {
                    if (!oData.results.length) {
                        MessageBox.error(that._oBundle.getText("NoRecordsFound"));
                        that.BusyDialog.close();
                    }
                    that.getView().setModel(new JSONModel(oData.results), "TreeModel");
                    that.onFetchWeeklyReport();
                    that.BusyDialog.close();
                },
                error: function (oError) {
                    MessageBox.error(JSON.parse(oError.responseText).error.message["value"]);
                    that.getView().getModel("TreeModel").setData([]);
                    that.getView().getModel("TreeModel").refresh();
                    that.BusyDialog.close();
                }
            });
        },
        onSearchRequester: function (oEvent) {
            var vSearchValue = oEvent.getParameter("newValue");
            var oList = this.byId("idApprovalMaster");
            var oListBindings = oList.getBinding("items");
            var productFilter = new Filter([
                new Filter("Serialno", FilterOperator.Contains, vSearchValue),
                new Filter("Plant", FilterOperator.Contains, vSearchValue)
                // new Filter("Material", FilterOperator.Contains, vSearchValue)
            ], false);
            oListBindings.filter([productFilter]);
        },
        onFetchWeeklyReport: function (oEvent) {
            this.byId("id_ApproveBtn").setVisible(true);
            this.byId("id_RejectBtn").setVisible(true);
            var oApprVBox = this.byId("idApprVBox");
            if(oEvent === undefined){
                var groupedData = [];
                oApprVBox.removeAllItems();
                 this.byId("idDetailStatus").setText("");
                this.byId("idDetailMonth").setText("");
                // this.byId("idDetailMaterial").setText("");
                this.byId("idDetailTotQuantity").setText("");
            }else{
            var vSelectedItemPath = oEvent.getSource().getBindingContext("TreeModel").sPath;
            var oSelectedItem = this.getView().getModel("TreeModel").getProperty(vSelectedItemPath);
            this.ApprovalPageSelectedItem = [];
            this.ApprovalPageSelectedItem.push(oSelectedItem);
            var aWeeklyData = oSelectedItem.TransporterAllocWeeklySet.results;
            oApprVBox.removeAllItems();
            if (!aWeeklyData.length) {
                MessageBox.error(this._oBundle.getText("NoWeekData"));
                this.byId("idDetailStatus").setText("");
                this.byId("idDetailMonth").setText("");
                // this.byId("idDetailMaterial").setText("");
                this.byId("idDetailTotQuantity").setText("");
                return;
            }
            this.byId("idDetailStatus").setText(oSelectedItem.Status);
            var vMonthText = this.getView().getModel("oMonthsModel").getData().months.find(item => item.key === oSelectedItem.Month);
            this.byId("idDetailMonth").setText(vMonthText.name);
            // this.byId("idDetailMaterial").setText(oSelectedItem.Material);
            this.byId("idDetailTotQuantity").setText(oSelectedItem.Mquan);
            // Group data by WeekNo
            var groupedData = aWeeklyData.reduce(function (acc, curr) {
                (acc[curr.WeekNo] = acc[curr.WeekNo] || []).push(curr);
                return acc;
            }, {});
        }
            for (var week in groupedData) {
                var oTable = new sap.ui.table.Table({
                    // title: "Weekly Plan",
                    selectionMode: "None",
                    // visibleRowCount: 10,
                    columns: [
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Week", wrapping: true }),
                            template: new sap.m.Text({ text: "{WeekNo}" }),
                            width: "51px",
                            sortProperty: "WeekNo"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Start Date", wrapping: true }),
                            template: new sap.m.Text({ text: "{WeekSdate}" }),
                            width: "87px",
                            sortProperty: "WeekSdate"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "End Date", wrapping: true }),
                            template: new sap.m.Text({ text: "{WeekEdate}" }),
                            width: "87px",
                            sortProperty: "WeekEdate"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Transporter", wrapping: true }),
                            template: new sap.m.Text({ text: "{Transporter}" }),
                            width: "87px",
                            sortProperty: "Transporter"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Transporter Name", wrapping: true }),
                            template: new sap.m.Text({ text: "{TransporterName}" }),
                            width: "200px",
                            sortProperty: "TransporterName"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Quantity", wrapping: true }),
                            template: new sap.m.Text({ text: "{Quantity}" }),
                            width: "70px",
                            sortProperty: "Quantity"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "UOM", wrapping: true }),
                            template: new sap.m.Text({ text: "{Uom}" }),
                            width: "50px",
                            sortProperty: "Uom"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Truck Required", wrapping: true }),
                            template: new sap.m.Text({ text: "{NoOfTrucks}" }),
                            width: "73px",
                            sortProperty: "NoOfTrucks"
                        }),
                        new sap.ui.table.Column({
                            label: new sap.m.Label({ text: "Status", wrapping: true }),
                            template: new sap.m.Text({ text: "{Status}" }),
                            width: "178px",
                            sortProperty: "Status"
                        })
                    ]
                });
                var oModel = new sap.ui.model.json.JSONModel({ WeeklyPlan: groupedData[week] });
                oTable.setModel(oModel);
                var rowCount = groupedData[week].length;
                oTable.setVisibleRowCount(rowCount);
                oTable.bindRows("/WeeklyPlan");
                var oPanel = new sap.m.Panel({
                    headerText: "Week " + week,
                    expandable: true,
                    expanded: false,
                    content: [oTable]
                });
                oApprVBox.addItem(oPanel);
            }
        },

        // Reports Screen Services
        onReportTransporterF4: function (oEvent) {
            var vPlantList = this?.reportPlantList;
            if (!vPlantList || !vPlantList.length) {
                MessageToast.show(this._oBundle.getText("SelectPlantF4"));
                return;
            }
            var oThat = this;
            oThat.BusyDialog.open();
            if (!oThat.transporter) {
                oThat.transporter = sap.ui.xmlfragment("com.olam.zgtmmtruckalloc.fragments.ReportTransporter", oThat);
                oThat.oView.addDependent(oThat.transporter);
            }
            var oDataModel = this.getOwnerComponent().getModel();
            var oFilter = [];
            for (var plant of vPlantList) {
                oFilter.push(
                    new Filter("Plant", FilterOperator.EQ, plant)
                );
            }
            oDataModel.read("/TransporterAllocWeeklySet", {
                filters: oFilter,
                success: function (oData, oResponse,) {
                    var aResults = oData.results;
                    var oTransporter = new JSONModel();
                    oTransporter.setSizeLimit(aResults.length);
                    oTransporter.setData(aResults);
                    oThat.getView().setModel(oTransporter, "oTransporterModel");
                    oThat.transporter.open();
                    oThat.BusyDialog.close();
                },
                error: function (error) {

                },
            });
        },

        onReportTransporterF4Confirm: function (oEvent) {
            var oSelectedItems = oEvent.getParameter("selectedItems");
            if (oSelectedItems) {
                var oMultiInput = this.byId("id_ReportTransporter");
                oMultiInput.removeAllTokens();
                oSelectedItems.forEach(function (oItem) {
                    var sText = oItem.getTitle();
                    var oToken = new sap.m.Token({
                        text: sText
                    });
                    oMultiInput.addToken(oToken);
                });
            }
            oEvent.getSource().getBinding("items").filter([]);
        },

        onReportTransporterF4Search: function (oEvent) {
            var sValue = oEvent.getParameter("value").trim(),
                oBinding = oEvent.getSource().getBinding("items"),
                oFilter = new sap.ui.model.Filter([
                    new Filter("Transporter", sap.ui.model.FilterOperator.Contains, sValue),
                    new Filter("TransporterName", sap.ui.model.FilterOperator.Contains, sValue)
                ]);
            var oFilter2 = new sap.ui.model.Filter(oFilter, false);
            oBinding.filter([oFilter2]);
        },
        onClearReportFilters: function () {
            this.byId("id_ReportPlant").removeAllTokens();
            this.byId("id_ReportRangePicker").setValue('');
            this.byId("id_ReportTransporter").removeAllTokens();
            this.byId("idProcessStep").setSelectedItem(null);
            this.byId("id_ReportType").setSelectedIndex(0);
            // this.getView().getModel("TableModel").setData([]);
            // this.getView().getModel("TableModel").refresh(true);
        },
        onReportTypeChange: function (oEvent) {
            var oSelectedItemIndex = oEvent.getParameter("selectedIndex");
            if (oSelectedItemIndex === 2) {
                this.byId("id_ReportFilterTATType").setVisible(true);
            } else {
                this.byId("id_ReportFilterTATType").setVisible(false);
            }

        },
        onFetchReportsData: function () {
            var vPlantTokens = this.byId("id_ReportPlant").getTokens();
            var vStartMonthObj = this.byId("id_ReportRangePicker").getDateValue();
            var vEndMonthObj = this.byId("id_ReportRangePicker").getSecondDateValue();
            var vTransporterTokens = this.byId("id_ReportTransporter")?.getTokens();
            var vTATProcessType = this.byId("idProcessStep")?.getSelectedKey();
            var vSelectedReport = this.byId("id_ReportType").getSelectedIndex();
            if (!vPlantTokens.length) {
                MessageToast.show(this._oBundle.getText("SelectPlantF4"));
                return;
            }
            if (!vStartMonthObj || !vEndMonthObj) {
                MessageToast.show(this._oBundle.getText("SelectMonthRange"));
                return;
            }
            var oFilters = [];
            if (vSelectedReport === 2) {
                if (vTATProcessType) {
                    oFilters.push(new Filter('TATProcess ', FilterOperator.EQ, vTATProcessType));
                } else {
                    MessageToast.show(this._oBundle.getText("SelectTATType"));
                    return;
                }
            }
            oThat.BusyDialog.open();
            vPlantTokens.forEach(item => oFilters.push(new Filter('Plant', FilterOperator.EQ, `'${item.getText()}'`)));
            var vStartDate = vStartMonthObj.getFullYear() + String(vStartMonthObj.getMonth() + 1).padStart(2, '0');
            var vEndDate = vEndMonthObj.getFullYear() + String(vEndMonthObj.getMonth() + 1).padStart(2, '0');
            if (vStartDate && vEndDate) {
                oFilters.push(new Filter({
                    path: "Date_Range",
                    operator: FilterOperator.BT,
                    value1: `'${vStartDate}'`,
                    value2: `'${vEndDate}'`
                }));
            }
            vTransporterTokens?.length ? vTransporterTokens.forEach(item => oFilters.push(new Filter('Transporter', FilterOperator.EQ, `'${item.getText()}'`))) : [];
            var vReportTypeIndex = this.byId("id_ReportType").getSelectedIndex();
            var oModel = this.getOwnerComponent().getModel();
            if (vReportTypeIndex === 0) {
                oModel.read("/PlanVsActSet", {
                    filters: oFilters,
                    success: function (oData) {
                        oThat.createColumnConfig(oData.results[0]);
                        oThat.BusyDialog.close();
                    },
                    error: function (oError) {
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                        oThat.BusyDialog.close();
                    }
                });
            } else if (vReportTypeIndex === 1) {
                oModel.read("/TripDetailsSet", {
                    filters: oFilters,
                    urlParameters: {
                        $expand: "TripBatchNav,TripInvNav"
                    },
                    success: function (oData) {
                        oThat.createColumnConfig(oData.results[0]);
                        oThat.BusyDialog.close();
                    },
                    error: function (oError) {
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                        oThat.BusyDialog.close();
                    }
                });
            } else if (vReportTypeIndex === 2) {
                oModel.read("/TATSet", {
                    filters: oFilters,
                    success: function (oData) {
                        oThat.createColumnConfig(oData.results[0]);
                        oThat.BusyDialog.close();
                    },
                    error: function (oError) {
                        MessageBox.error(JSON.parse(oError.responseText).error.message.value);
                        oThat.BusyDialog.close();
                    }
                });
            } else {
                oThat.BusyDialog.close();
            }
            // var cols = {
            //     "Reports": [
            //         {
            //             // "Plant": "1317",
            //             // "CompanyCode": "C001",
            //             // "Month": "October",
            //             "Plant": "",
            //             "Company_Code": "",
            //             "Month": "",
            //             "Year": "2025",
            //             "Transporter_Number": "T123",
            //             "TransporterDescription": "ABC Logistics",
            //             "MonthlyTruckPlanned": 50,
            //             "InProgressTruck": 10,
            //             "WBID": "WB98765",
            //             "Status": "In Transit",
            //             "VehicleNo": "KA01AB1234",
            //             "VehicleType": "Truck",
            //             "DriverName": "Ramesh",
            //             "DriverMobileNo": "9876543210",
            //             "CreatedBy": "Admin",
            //             "CreatedOn": "2025-10-15",
            //             "CreatedTime": "14:30",
            //             "DeliveryNo": "D456789",
            //             "ItemNo": "10",
            //             "Material": "MAT001",
            //             "MaterialDescription": "Steel Rods",
            //             "ShippingPoint": "SP01",
            //             "Division": "DIV01",
            //             "DistributionChannel": "DC01",
            //             "Incoterms": "FOB",
            //             "DeliveryQty": 100,
            //             "GrossWeight": 5000,
            //             "UOM": "KG",
            //             "Route": "R001",
            //             "Batch": "BATCH01",
            //             "ReceivingPlant": "2001",
            //             "MaterialDocumentNo": "MD98765",
            //             "PurchOrg": "PO01",
            //             "Reference": "REF123",
            //             "BillDate": "2025-10-14",
            //             "StatusDescription": "Delivered"
            //         }
            //     ]
            // }
            // this.createColumnConfig(cols);
        },
        createColumnConfig: function (aCols) {
            var vReportTypeText = this.byId("id_ReportType").getSelectedButton().getText();
            var oTable = this.byId("idReportsTable");
            oTable.removeAllColumns();
            var aFilteredReports = aCols?.Reports?.map(function (oRow) {
                var oCleanRow = {};
                Object.keys(oRow).forEach(function (key) {
                    if (oRow[key] !== null && oRow[key] !== "" && oRow[key] !== undefined) {
                        oCleanRow[key] = oRow[key];
                    }
                });
                return oCleanRow;
            });

            // If no data after filtering, show message or keep empty table
            if (!aFilteredReports || aFilteredReports.length === 0) {
                sap.m.MessageToast.show(this._oBundle.getText("NOReportData"));
                return;
            }
            // Columns to display
            var aVisibleKeys = [
                "Plant",
                "CompanyCode",
                "Month",
                "Year",
                "TransporterNumber",
                "TransporterDescription",
                "MonthlyTruckPlanned",
                "InProgressTruck",
                "WBID",
                "Status",
                "VehicleNo",
                "VehicleType",
                "DriverName"
            ];
            var aKeys = Object.keys(aFilteredReports[0]);
            aKeys.forEach(function (sKey) {
                var oColumn = new sap.ui.table.Column({
                    label: new sap.m.Label({ text: sKey.split('_').join(' '), wrapping: true }),
                    template: new sap.m.Text({ text: "{" + sKey + "}" }),
                    sortProperty: sKey,
                    filterProperty: sKey,
                    width: '7rem',
                    visible: !aVisibleKeys.includes(sKey)
                });
                oTable.addColumn(oColumn);
            });
            this.byId("idToolbarTitle").setText(vReportTypeText);
            this.byId("idReportsToolbar").setVisible(true);
            var oModel = new sap.ui.model.json.JSONModel({ Reports: aFilteredReports });
            oTable.setModel(oModel);
            oTable.bindRows("/Reports");
        },


        onSendEmailPress: function () {
            const email = "someone@example.com";
            // const subject = "Hello from Fiori";
            // const body = "This is a test email.";
            // window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            // function generateHtmlTable(data) {
            //     let html = "<table border='1'><tr><th>Column1</th><th>Column2</th></tr>";
            //     Object.keys(data).forEach(row => {
            //         html += `<tr><td>${row.column1}</td><td>${row.column2}</td></tr>`;
            //     });
            //     html += "</table>";
            //     return html;
            // }


            // const emailPayload = {
            //     to: "recipient@example.com",
            //     subject: "Table Data",
            // body= generateHtmlTable(tableData)
            // };


            // const modelData = this.getView().getModel("WeekModel").getData().data[0];
            // body = generateHtmlTable(modelData)
            const body = `Order ID: 12345\nCustomer: dfghj`;
            // const body = modelData;
            window.location.href = `mailto:${email}?subject=Order Details&body=${encodeURIComponent(body)}`;

        }

    });
});