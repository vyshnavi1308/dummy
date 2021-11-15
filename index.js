define([
	'require',
	'module',
	'{angular}/angular',
	
], function(require, module, angular) {
	'use strict';

	var seedStoreSupplierManagement = angular.module('SupplierManagement', []),
		config = module && module.config() || {};

	seedStoreSupplierManagement.factory('SupplierService', ['$resource', function($resource) {
		var Supplier = $resource(require.toUrl(config.apiUrl + 'suppliers/:supplierCode'), {}, {
			'update': { method: 'PUT' }
		});

		return {
			allPaginatedSuppliers: function(pageIndex, pageSize, success, error) {
				return Supplier.query({ pageIndex: pageIndex, pageSize: pageSize }, success, error);
			},
			searchPaginatedSuppliers: function(searchString, pageIndex, pageSize, success, error) {
				return Supplier.query({
					searchString: searchString,
					pageIndex: pageIndex,
					pageSize: pageSize
				}, success, error);
			},
			supplier: function(id, success, error) {
				return Supplier.get({ supplierCode: id }, success, error);
			},
			deleteSupplier: function(supplier, success, error) {
				supplier.$delete(success, error);
			},
			addSupplier: function(supplier, success, error) {
				var newSupplier = new Supplier();

				newSupplier.id = supplier.id;
				newSupplier.address = supplier.address;


				newSupplier.$save(success, error);
			},
			updateSupplier: function(supplier, success, error) {
				supplier.$update( { supplierCode: supplier.id },success, error);
			}
		};
	}]);

	seedStoreSupplierManagement.controller('ModalSupplierController', ['$scope', '$uibModalInstance', 'supplier', 'modalTitle', function($scope, $uibModalInstance, supplier, modalTitle) {
		$scope.modalTitle = modalTitle;
		$scope.supplier = supplier;
		$scope.ok = function() {
			$uibModalInstance.close($scope.supplier);
		};
		$scope.cancel = function() {
			$uibModalInstance.dismiss('cancel');
		};
	}]);

	seedStoreSupplierManagement.controller('SuppliersManagementController', ['$scope', '$uibModal', 'SupplierService', function($scope, $uibModal, supplierService) {

		function modal(title, template, controller, supplier, callback) {
			var modalInstance = $uibModal.open({
				templateUrl: template,
				controller: controller,
				resolve: {
					supplier: function() {
						return supplier;
					},
					modalTitle: function() {
						return title;
					}
				}
			});
			modalInstance.result.then(function(data) {
				callback(data);
			});
		}

		function getSuppliersSuccess(data) {
			$scope.paginatedSuppliers = data;
			$scope.pagination.totalServerItems = $scope.paginatedSuppliers.$viewInfo.totalSize;
			if ($scope.paginatedSuppliers.length) {
				$scope.activeSupplier = $scope.paginatedSuppliers[0];
			}
		}

		function getSuppliersError(err) {
			throw new Error('could not get supplier list ' + err);
		}

		function getSuppliers() {
			supplierService.allPaginatedSuppliers($scope.pagination.currentPage, $scope.pagination.pageSize, getSuppliersSuccess, getSuppliersError);
		}

		function searchSuppliers(searchString) {
			if (searchString) {
				supplierService.searchPaginatedSuppliers(searchString, $scope.pagination.currentPage, $scope.pagination.pageSize, getSuppliersSuccess, getSuppliersError);
			} else {
				getSuppliers();
			}
		}

		$scope.pagination = {
			pageSize: 10,
			currentPage: 1,
			totalServerItems: 0
		};

		$scope.pageChanged = function() {
			getSuppliers();
		};

		$scope.createNewSupplier = function() {
			modal('Add a supplier', 'modalSupplier.html', 'ModalSupplierController', {}, function(newSupplier) {
				supplierService.addSupplier(newSupplier,
					function() {
						getSuppliers();
					},
					function(err) {
						throw new Error('Could not add new supplier ' + err);
					});
			});
		};
		$scope.activateSelectedSupplier = function(){
			if(listsupplier.length>0){
				for(var i=0;i<listsupplier.length;i++){
					$scope.paginatedSuppliers[i].activationDate=new Date();
				}
			}
					};
					var listsupplier = [];
					$scope.selectedsupplier = function(index){
						if(listsupplier.length==0){
							listsupplier.push(index);
						}else{
							for(var i=0;i<listsupplier.length;i++){
								if(i==index){
									listsupplier.splice(i,1);
									break;
								}else{
									listsupplier.push(index);
									break;
								}
							}
						}
					}

		$scope.editSupplier = function(supplier) {
			modal('Edit supplier', 'modalSupplier.html', 'ModalSupplierController', supplier, function(supplier) {
				supplierService.updateSupplier(supplier,
					function() {
						getSupplier();
					},
					function(err) {
						throw new Error('Could not update supplier ' + err);
					});
			});
		};

		$scope.deleteSupplier = function(supplier) {
			modal('Delete a supplier', 'modalConfirmSupplier.html', 'ModalSupplierController', supplier, function(supplier) {
				supplierService.deleteSupplier(supplier,
					function() {
						getSuppliers();
					},
					function(err) {
						throw new Error('Could not delete supplier ' + err);
					});
			});
		};
		
		
		$scope.isSelected = function() {
var somethingSelected = false;
$scope.suppliers.forEach(function (supplier, index) {
this.push(supplier + ': ' + index);
if (supplier.selected) somethingSelected = true;
});

$scope.showDelete = somethingSelected;
};

		$scope.$watch('searchedSupplier', function(newSearch, oldSearch) {
			if (newSearch !== oldSearch) {
				searchSuppliers(newSearch);
			}
		});

		getSuppliers();
	}]);

	return {
		angularModules: ['SupplierManagement']
	};
});

