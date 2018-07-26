function initDictionaryTab()
{
	var D = new Dictionary();
	
	var sFI = new SuperFileInput(document.getElementById("importButton"));
	sFI.onChooseFile =
		function(file)
		{	
			var reader = new FileReader();
			reader.onload = function(e)
				{
					var json = e.target.result;
					D.setData(JSON.parse(json)).then(
						function()
						{	console.log("Done putting data");
							$("#wordTable").jsGrid("loadData");
						}
					);
				};
			reader.readAsText(file);
		};
		
	document.getElementById("clearButton").addEventListener("click",
		function(e)
		{
			var response = window.prompt("To delete all words, type \"yes\".");
			console.log(response);
			if (response == "yes")
			{
				D.clear().then(
					function()
					{
						$("#wordTable").jsGrid("loadData");
					}
				);
			}
		}
	);
	
	var dateString = (new Date()).toLocaleString();
	document.getElementById("downloadLink").setAttribute("download", `Dictionary (${dateString}).json`);

	updateJson(D);
	
	var controller = 	
	{
		loadData: async function(filter)
		{			
			console.log("Load data called");
			var dictOfEntries = await D.getEverything();
			var listOfEntries = Object.values(dictOfEntries);
			console.log("Loaded:");
			console.log(listOfEntries);
			return listOfEntries;
		},
		
		insertItem: function(item)
		{
			console.log(item);
		},
		
		updateItem: function(item)
		{
			D.setData([item]);
			updateJson(D);
		},
		
		deleteItem: function(item)
		{
			D.removeEntries([item.word]);
			updateJson(D);
		}
	};
	
	$("#wordTable").jsGrid(
		{
			width: "100%",
			height: "400px",
			
			autoload: true,
			controller: controller,
			rowClick: function(args)
			{
				WordEditDialog.open(
					{
						entry: args.item
					}
				).then(
					function(entries)
					{
						$("#wordTable").jsGrid("updateItem", entries.oldEntry, entries.newEntry);
					}
				);
			},
			
			editing: true,
			sorting: true,			
			paging: true,
			deleteConfirm: "Really delete this word?",
			
			fields: [
				{ title: "Word", name: "word", type: "text", width: 150 },
				{ title: "Translation", name: "definition", type: "text", width: 150 },
				{ type: "control", editButton: false }
			]
		}
	);
	
	document.addEventListener("tabChange",
		function(e)
		{
			if (e.detail == "dictionary")
			{
				$("#wordTable").jsGrid("render");
			}
		}
	);

	function updateJson(dict)
	{
		dict.getEverything().then(
			function(data)
			{
				var json = JSON.stringify(Object.values(data));
				document.getElementById("downloadLink").setAttribute("href", "data:application/json," + json);			
			}
		);
	}

	function SuperFileInput(domElement)
	{
		this.domElement = domElement;
		this.onChooseFile = function(f) {};
		var _this = this;
		
		this.fileInput = document.createElement("input");
		this.fileInput.setAttribute("type", "file");
		this.fileInput.addEventListener("change",
			function(e)
			{
				_this.onChooseFile(e.target.files[0]);
			}
		);
		
		this.domElement.addEventListener("click",
			function(e)
			{
				_this.fileInput.click();
			}
		);
	}
}