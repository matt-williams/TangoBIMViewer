function ThreeJsViewer(){

    this.selectedMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    this.unselectedMaterial = new THREE.MeshPhongMaterial({color: 0xFF0000});

    this.init = function(container) {

        this.projector = new THREE.Projector();
        this.size = {width: container.width(), height: container.height()};

        this.renderer = new THREE.WebGLRenderer({alpha:true});
        this.renderer.sortObjects = false;
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize( this.size.width, this.size.height);

        this.scene = new THREE.Scene();

        //this.camera = new THREE.PerspectiveCamera(tango.getFov(), tango.getAspectRatio(), 1, 100000); // fov, aspect, near, far
        this.camera = new THREE.PerspectiveCamera(50, this.size.width / this.size.height, 1, 100000); // fov, aspect, near, far
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, 0, 0);

        this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
        this.controls.minDistance = 0.1;
        this.controls.maxDistance = 100000;
        this.controls.target.position = new THREE.Vector3(0, 0, 0);
        this.controls.screen.width =  this.size.width;
        this.controls.screen.height = this.size.height;
        
        this.root2 = new THREE.Object3D();
        this.scene.add(this.root2);

        this.root = new THREE.Object3D();
        this.root2.add(this.root);

        var light1 = new THREE.DirectionalLight(0xffffff, 2);
        light1.position.x = .5;
        light1.position.y = 1;
        light1.position.z = 2;
        light1.position.normalize();
        this.scene.add(light1);

        var light2 = new THREE.DirectionalLight(0x555555, 1);
        light2.position.x = - 2;
        light2.position.y = - 1;
        light2.position.z = - .5;
        light2.position.normalize();
        this.scene.add(light2);

        container.click({viewer: this}, this.onMouseDown);
        container.append(this.renderer.domElement);
        this.container = container;
        this.onclick = function(){};

        this.maxExtent = 0;
    };

    this.centerScene = function(){
        var bb = new THREE.Box3()
        var material = this.unselectedMaterial;
        $.each(this.root.children, function(i,object){
            bb.union(new THREE.Box3().setFromObject(object));
            object.material = material;
        });
        var ext = {x: bb.max.x - bb.min.x, y: bb.max.y - bb.min.y, z: bb.max.z - bb.min.z};
this.root.position.set(0, 0, 0);
this.root.rotateZ(Math.PI * -0.52);
        //this.root.position.set(ext.x * -.5 - bb.min.x, ext.y * -.5 - bb.min.y, ext.z * -.5 - bb.min.z);
        this.root.translateX(ext.x * -.5 - bb.min.x);
this.root.translateY(ext.y * -.5 - bb.min.y);
this.root.translateZ(ext.z * -.5 - bb.min.z);
this.root.translateZ(2500);
this.root.translateY(6000);
        var maxExtent = Math.max(ext.x, ext.y, ext.z);
        this.maxExtent = maxExtent;
        // TODO: adjust clipping
    };

    this.loadSerializedModel = function(serializedModel){
        this.clearModel();
        var model = JSON.parse( serializedModel );
        var loader = new THREE.ObjectLoader();
        var loadedScene = loader.parse(model, function(object){
            // object.material=material;
        });
        this.root.add.apply(this.root, loadedScene.children);
        this.centerScene();
        this.renderer.render(this.scene,this.camera);
    };

    this.clearModel = function(){
        this.scene.remove(this.root);
        this.root = new THREE.Object3D();
        this.scene.add(this.root);
    };

    this.onMouseDown = function(event) {
        var viewer = event.data.viewer;

        event.preventDefault();

        var mouse = new THREE.Vector3(0, 0, 0);
        mouse.x = (event.pageX - viewer.container.offset().left) / viewer.size.width * 2 - 1; // ( event.clientX / this.size.width ) * 2 - 1;
        mouse.y = - (event.pageY - viewer.container.offset().top) / viewer.size.height * 2 + 1; // - ( event.clientY / this.size.height ) * 2 + 1;

        viewer.projector.unprojectVector(mouse, viewer.camera);

        var ray = new THREE.Raycaster(viewer.camera.position, mouse.sub(viewer.camera.position).normalize());

        var intersects = ray.intersectObjects(viewer.root.children);
        if (intersects.length > 0) {
            if (viewer.selected != intersects[0].object) {
                if (viewer.selected) viewer.selected.material = viewer.unselectedMaterial;
                viewer.selected = intersects[0].object;
                viewer.selected.material = viewer.selectedMaterial;
            }
        } else {
            if (viewer.selected) viewer.selected.material = viewer.unselectedMaterial;
            viewer.selected = null;
        }
        viewer.onClick(viewer.selected ? viewer.selected.uuid : null);
    };

    this.animate = function() {
        this._animate()();
    };

    this._animate = function(){
        var viewer = this;
        return function(){
            requestAnimationFrame(viewer._animate());
            viewer.render();
        }
    };

    this.render = function() {
        if (tango.getStatus() == "VALID") {
            this.controls.update();
            var translation = JSON.parse(tango.getTranslation());
            this.camera.position.set(translation[0] * 1500, translation[1] * 1500, translation[2] * 1500);
            //this.camera.position.set(this.ranslation[0], this.translation[1], this.translation[2]);
            //this.camera.position.set(this.maxExtent - translation[0] * 10000, this.maxExtent - translation[1] * 10000, this.maxExtent - translation[2] * 10000);
            var rotation = JSON.parse(tango.getRotation());
            var quat = new THREE.Quaternion();
            quat.fromArray(rotation, 0);
            this.camera.rotation.setFromQuaternion(quat, undefined, true);
            //console.log("Ours: " + this.camera.rotation.toArray());
            //this.camera.lookAt(new THREE.Vector3(0,0,0));
            //console.log("THeirs: " + this.camera.rotation.toArray());

            this.renderer.render(this.scene,this.camera);
       }
    };
}
